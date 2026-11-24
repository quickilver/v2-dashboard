import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { DeliveryService } from '../../../../services/delivery.service';
import { DeliveryModel } from '../../../../models/delivery.model';
import { DeliveriesIndexResponse } from '../../../../models/responses/deliveries/deliveries-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { DeliveryIndexParams } from '../../../../models/params/delivery-index.params';
import { DeliveriesEditorComponent } from '../deliveries-editor/deliveries-editor';

@Component({
    selector: 'app-deliveries-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './deliveries-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveriesListingComponent implements OnInit {
    private readonly deliveryService = inject(DeliveryService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px', isDefault: true },
        { key: 'position', title: 'Позиция', sortable: true, width: '100px', isDefault: true },
        { key: 'title', title: 'Название', sortable: true, isDefault: true },
        { key: 'description', title: 'Описание', sortable: false, isDefault: true },
    ]);

    columnsStorageKey = 'deliveries';

    deliveries = signal<DeliveryModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = 'position';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadDeliveries();
    }

    async loadDeliveries(): Promise<void> {
        this.loading.set(true);
        try {
            const params: DeliveryIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.currentSearch,
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: DeliveriesIndexResponse = await this.deliveryService.index(params);
            this.deliveries.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке способов доставки');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(delivery: DeliveryModel): void {
        this.onEdit(delivery);
    }

    onEdit(delivery: DeliveryModel): void {
        this.popupService
            .open('Редактирование способа доставки', DeliveriesEditorComponent, { id: delivery.id })
            .then(() => {
                this.loadDeliveries();
            });
    }

    async onDelete(delivery: DeliveryModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление способа доставки',
            `Вы уверены, что хотите удалить способ доставки "${delivery.title}"?`,
            'Удалить',
            'Отмена',
        );

        if (confirmed) {
            try {
                await this.deliveryService.delete(delivery.id);
                this.notificationService.success('Способ доставки успешно удалён');
                this.loadDeliveries();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении способа доставки');
            }
        }
    }

    createClick(duplicateFromId: number | null = null): void {
        this.popupService
            .open('Создание способа доставки', DeliveriesEditorComponent, { duplicateFromId })
            .then(() => {
                this.loadDeliveries();
            });
    }

    onSearch(query: string): void {
        this.currentSearch = query;
        this.page.set(1);
        this.loadDeliveries();
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadDeliveries();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadDeliveries();
    }

    onPageSizeChange(pageSize: number): void {
        this.pageSize.set(pageSize);
        this.page.set(1);
        this.loadDeliveries();
    }
}
