import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { StatusService } from '../../../../services/status.service';
import { StatusModel } from '../../../../models/status.model';
import { StatusesIndexResponse } from '../../../../models/responses/statuses/statuses-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { StatusIndexParams } from '../../../../models/params/status-index.params';
import { StatusesEditorComponent } from '../statuses-editor/statuses-editor';

@Component({
    selector: 'app-statuses-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './statuses-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusesListingComponent implements OnInit {
    private readonly statusService = inject(StatusService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px', isDefault: true },
        { key: 'title', title: 'Название', sortable: true, isDefault: true },
        { key: 'position', title: 'Позиция', sortable: true, width: '120px', isDefault: true },
    ]);

    columnsStorageKey = 'statuses';

    statuses = signal<StatusModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadStatuses();
    }

    async loadStatuses(): Promise<void> {
        this.loading.set(true);
        try {
            const params: StatusIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.currentSearch,
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: StatusesIndexResponse = await this.statusService.index(params);
            this.statuses.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке статусов');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(status: StatusModel): void {
        this.onEdit(status);
    }

    onEdit(status: StatusModel): void {
        this.popupService
            .open('Редактирование статуса', StatusesEditorComponent, { id: status.id })
            .then(() => {
                this.loadStatuses();
            });
    }

    async onDelete(status: StatusModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление статуса',
            `Вы уверены, что хотите удалить статус "${status.title}"?`,
            'Удалить',
            'Отмена',
        );

        if (confirmed) {
            try {
                await this.statusService.delete(status.id);
                this.notificationService.success('Статус успешно удалён');
                this.loadStatuses();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении статуса');
            }
        }
    }

    createClick(): void {
        this.popupService.open('Создание статуса', StatusesEditorComponent).then(() => {
            this.loadStatuses();
        });
    }

    onSearch(query: string): void {
        this.currentSearch = query;
        this.page.set(1);
        this.loadStatuses();
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadStatuses();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadStatuses();
    }
}
