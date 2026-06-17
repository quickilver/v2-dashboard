import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { StoreService } from '../../../../services/store.service';
import { StoreModel } from '../../../../models/store.model';
import { StoresIndexResponse } from '../../../../models/responses/stores/stores-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { StoreEditorComponent } from '../store-editor/store-editor';
import { StoreIndexParams } from '../../../../models/params/store-index.params';

@Component({
    selector: 'app-store-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './store-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreListingComponent implements OnInit {
    private readonly storeService = inject(StoreService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'title', title: 'Название', sortable: true },
        { key: 'address', title: 'Адрес', sortable: true }
    ]);

    stores = signal<StoreModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadStores();
    }

    async loadStores(): Promise<void> {
        this.loading.set(true);
        try {
            const params: StoreIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                sort: this.currentSort,
                direction: this.currentDirection
            };

            const response: StoresIndexResponse = await this.storeService.index(params);
            this.stores.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке магазинов');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(store: StoreModel): void {
        this.onEdit(store);
    }

    onEdit(store: StoreModel): void {
        this.popupService.open(
            'Редактирование магазина',
            StoreEditorComponent,
            { id: store.id }
        ).then(() => {
            this.loadStores();
        });
    }

    async onDelete(store: StoreModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление магазина',
            `Вы уверены, что хотите удалить магазин "${store.title}"?`,
            'Удалить',
            'Отмена'
        );

        if (confirmed) {
            try {
                await this.storeService.delete(store.id);
                this.notificationService.success('Магазин успешно удален');
                this.loadStores();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении магазина');
            }
        }
    }

    createClick(): void {
        this.popupService.open(
            'Создание магазина',
            StoreEditorComponent
        ).then(() => {
            this.loadStores();
        });
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadStores();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadStores();
    }
}
