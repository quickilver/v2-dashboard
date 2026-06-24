import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { AttributeService } from '../../../../services/attribute.service';
import { AttributeShortModel } from '../../../../models/attributes/attribute-short.model';
import { AttributesIndexResponse } from '../../../../models/responses/attributes/attributes-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { AttributesEditorComponent } from '../attributes-editor/attributes-editor';
import { AttributeIndexParams } from '../../../../models/params/attribute-index.params';

@Component({
    selector: 'app-attributes-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './attributes-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributesListingComponent implements OnInit {
    private readonly attributeService = inject(AttributeService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'title', title: 'Название', sortable: true },
        {
            key: 'is_display',
            title: 'Отображение',
            sortable: true,
            type: 'boolean',
            labels: { true: 'Да', false: 'Нет' },
        },
        {
            key: 'is_filter',
            title: 'Фильтр',
            sortable: true,
            type: 'boolean',
            labels: { true: 'Да', false: 'Нет' },
        },
    ]);

    attributes = signal<AttributeShortModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadAttributes();
    }

    async loadAttributes(): Promise<void> {
        this.loading.set(true);
        try {
            const params: AttributeIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: AttributesIndexResponse = await this.attributeService.index(params);
            this.attributes.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке характеристик');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(attribute: AttributeShortModel): void {
        this.onEdit(attribute);
    }

    onEdit(attribute: AttributeShortModel): void {
        this.popupService
            .open('Редактирование характеристики', AttributesEditorComponent, { id: attribute.id })
            .then(() => {
                this.loadAttributes();
            });
    }

    async onDelete(attribute: AttributeShortModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление характеристики',
            `Вы уверены, что хотите удалить характеристику "${attribute.title}"?`,
            'Удалить',
            'Отмена',
        );

        if (confirmed) {
            try {
                await this.attributeService.delete(attribute.id);
                this.notificationService.success('Характеристика успешно удалена');
                this.loadAttributes();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении характеристики');
            }
        }
    }

    createClick(): void {
        this.popupService.open('Создание характеристики', AttributesEditorComponent).then(() => {
            this.loadAttributes();
        });
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadAttributes();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadAttributes();
    }
}
