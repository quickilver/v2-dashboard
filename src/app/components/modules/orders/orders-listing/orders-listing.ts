import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { OrderService } from '../../../../services/order.service';
import { OrderModel } from '../../../../models/order.model';
import { OrdersIndexResponse } from '../../../../models/responses/orders/orders-index.response';
import { OrderIndexParams } from '../../../../models/params/order-index.params';
import { OrderFilters } from '../../../../models/orders/order-filters.model';
import { MetaModel } from '../../../../models/meta.model';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { OrdersFiltersComponent } from '../orders-filters/orders-filters';
import { OrdersEditorComponent } from '../orders-editor/orders-editor';
import { PriceHelper } from '../../../../helpers/price.helper';

@Component({
    selector: 'app-orders-listing',
    standalone: true,
    imports: [ListingComponent, OrdersFiltersComponent],
    templateUrl: './orders-listing.html',
    styleUrl: './orders-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListingComponent implements OnInit {
    private readonly orderService = inject(OrderService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'number', title: 'Номер', sortable: true, isDefault: true },
        { key: 'id', title: 'ID', sortable: true, width: '80px' },
        { key: 'contact_phone', title: 'Телефон', sortable: false, isDefault: true },
        { key: 'contact_email', title: 'Email', sortable: false, isDefault: true },
        { key: 'contact_last_name', title: 'Фамилия', sortable: false, isDefault: true },
        { key: 'contact_first_name', title: 'Имя', sortable: false, isDefault: true },
        {
            key: 'status',
            title: 'Статус',
            sortable: false,
            isDefault: true,
            formatter: (row: OrderModel) => row.status?.title ?? '',
        },
        {
            key: 'total_price',
            title: 'Сумма заказа',
            sortable: false,
            isDefault: true,
            formatter: (row: OrderModel) => row.total_price.toLocaleString('ru-RU') + ' ₽',
        },
    ]);

    columnsStorageKey = 'orders';

    orders = signal<OrderModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    filters = signal<OrderFilters>({
        query: '',
        account_id: null,
        product_id: null,
        date_from: '',
        date_to: '',
    });

    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadOrders();
    }

    async loadOrders(): Promise<void> {
        this.loading.set(true);

        try {
            const params: OrderIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.filters().query,
                sort: this.currentSort,
                direction: this.currentDirection,
                account_id: this.filters().account_id,
                product_id: this.filters().product_id,
                date_from: this.filters().date_from || null,
                date_to: this.filters().date_to || null,
            };

            const response: OrdersIndexResponse = await this.orderService.index(params);
            this.orders.set(response.data);
            this.meta.set(response.meta);
        } catch {
            this.notificationService.error('Ошибка при загрузке заказов');
        } finally {
            this.loading.set(false);
        }
    }

    onFiltersChange(filters: OrderFilters): void {
        this.filters.set(filters);
        this.page.set(1);
        this.loadOrders();
    }

    onRowClick(order: OrderModel): void {
        this.popupService
            .open(`Заказ ${order.number}`, OrdersEditorComponent, { id: order.id }, 'with-tabs')
            .then(() => this.loadOrders());
    }

    createClick(): void {
        this.popupService
            .open('Создание заказа', OrdersEditorComponent, {}, 'with-tabs')
            .then(() => this.loadOrders());
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadOrders();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadOrders();
    }
}
