import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    input,
    signal,
} from '@angular/core';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { IconComponent } from '../../../icon/icon';
import { OrderReportsFiltersComponent } from '../order-reports-filters/order-reports-filters';
import { AccountsEditorComponent } from '../../accounts/accounts-editor/accounts-editor';
import { OrdersEditorComponent } from '../../orders/orders-editor/orders-editor';
import { OrderService } from '../../../../services/order.service';
import { ReportService } from '../../../../services/report.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { OrderModel } from '../../../../models/order.model';
import { OrderReportFilters } from '../../../../models/reports/order-report-filters.model';
import { OrderReportDay } from '../../../../models/reports/order-report-day.model';

@Component({
    selector: 'app-order-reports',
    standalone: true,
    imports: [OrderReportsFiltersComponent, SkeletonComponent, IconComponent],
    templateUrl: './order-reports.html',
    styleUrl: './order-reports.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderReportsComponent implements OnInit {
    private readonly orderService = inject(OrderService);
    private readonly reportService = inject(ReportService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    readonly todayOnly = input<boolean>(false);
    readonly filters = signal<OrderReportFilters>(this.defaultFilters());

    readonly orders = signal<OrderModel[]>([]);
    readonly loading = signal<boolean>(false);
    readonly loadError = signal<boolean>(false);
    readonly exporting = signal<boolean>(false);
    readonly collapsedDays = signal<Record<string, boolean>>({});
    readonly expandedProducts = signal<Record<number, boolean>>({});

    readonly days = computed<OrderReportDay[]>(() => this.groupByDay(this.orders()));

    readonly totalPrice = computed<number>(() =>
        this.orders().reduce((sum, order) => sum + order.total_price, 0),
    );

    readonly totalCount = computed<number>(() =>
        this.orders().reduce((sum, order) => sum + order.total_count, 0),
    );

    ngOnInit(): void {
        this.loadOrders();
    }

    async loadOrders(): Promise<void> {
        this.loading.set(true);
        this.loadError.set(false);

        try {
            if (this.todayOnly()) {
                this.orders.set(await this.loadTodayOrders());
                return;
            }

            const filters = this.filters();
            const response = await this.orderService.index({
                per_page: 100,
                sort: 'created_at',
                direction: 'desc',
                account_id: filters.account_id,
                date_from: this.toApiDate(filters.date_from),
                date_to: this.toApiDate(filters.date_to),
            });

            this.orders.set(response.data);
        } catch {
            this.orders.set([]);
            this.loadError.set(true);
            if (!this.todayOnly()) {
                this.notificationService.error('Не удалось загрузить заказы для отчёта');
            }
        } finally {
            this.loading.set(false);
        }
    }

    private async loadTodayOrders(): Promise<OrderModel[]> {
        const start: Date = new Date();
        start.setHours(0, 0, 0, 0);

        const end: Date = new Date(start);
        end.setDate(end.getDate() + 1);
        const lastMoment: Date = new Date(end.getTime() - 1);
        const orders: OrderModel[] = [];
        let page: number = 1;
        let lastPage: number;

        do {
            const response = await this.orderService.index({
                page,
                per_page: 100,
                sort: 'id',
                direction: 'desc',
                date_from: start.toISOString().slice(0, 10),
                date_to: lastMoment.toISOString().slice(0, 10),
            });
            orders.push(...response.data);
            lastPage = response.meta.last_page;
            page++;
        } while (page <= lastPage);

        return orders
            .filter((order) => {
                const createdAt: number = Date.parse(order.created_at);
                return createdAt >= start.getTime() && createdAt < end.getTime();
            })
            .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));
    }

    onFiltersChange(filters: OrderReportFilters): void {
        this.filters.set(filters);
        this.loadOrders();
    }

    openOrder(order: OrderModel): void {
        this.popupService
            .open(`Заказ ${order.number}`, OrdersEditorComponent, { id: order.id }, 'with-tabs')
            .then(() => this.loadOrders());
    }

    openBuyer(accountId: number): void {
        void this.popupService
            .open('Редактирование клиента', AccountsEditorComponent, { id: accountId }, 'with-tabs')
            .then(() => this.loadOrders());
    }

    async exportToExcel(): Promise<void> {
        this.exporting.set(true);

        try {
            const blob = await this.reportService.exportOrders(this.filters());
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `orders-report-${this.toFileDate()}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            this.notificationService.error('Не удалось выгрузить отчёт в Excel');
        } finally {
            this.exporting.set(false);
        }
    }

    isCollapsed(date: string): boolean {
        const overrides = this.collapsedDays();

        if (date in overrides) {
            return overrides[date];
        }

        const firstDay = this.days()[0];

        return firstDay ? firstDay.date !== date : false;
    }

    toggleDay(date: string): void {
        const collapsed = this.isCollapsed(date);

        this.collapsedDays.update((days) => ({ ...days, [date]: !collapsed }));
    }

    isProductsExpanded(orderId: number): boolean {
        return this.expandedProducts()[orderId] ?? false;
    }

    toggleProducts(orderId: number): void {
        this.expandedProducts.update((orders) => ({
            ...orders,
            [orderId]: !orders[orderId],
        }));
    }

    formatPrice(value: number): string {
        return value.toLocaleString('ru-RU');
    }

    formatTime(value: string): string {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    accountName(order: OrderModel): string {
        const contactName: string = [
            order.contact_last_name,
            order.contact_first_name,
            order.contact_middle_name,
        ].filter(Boolean).join(' ');

        if (contactName || !order.account) {
            return contactName;
        }

        return [order.account.last_name, order.account.first_name, order.account.middle_name]
            .filter(Boolean)
            .join(' ');
    }

    private groupByDay(orders: OrderModel[]): OrderReportDay[] {
        const groups = new Map<string, OrderModel[]>();

        for (const order of orders) {
            const date = this.toDayKey(order.created_at);
            const dayOrders = groups.get(date) ?? [];

            dayOrders.push(order);
            groups.set(date, dayOrders);
        }

        return Array.from(groups.entries())
            .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
            .map(([date, dayOrders]) => ({
                date,
                label: this.formatDayLabel(date),
                orders: dayOrders,
                totalPrice: dayOrders.reduce((sum, order) => sum + order.total_price, 0),
                totalCount: dayOrders.reduce((sum, order) => sum + order.total_count, 0),
            }));
    }

    private toDayKey(value: string): string {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        return `${date.getFullYear()}-${month}-${day}`;
    }

    private formatDayLabel(dateKey: string): string {
        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        if (Number.isNaN(date.getTime())) {
            return dateKey;
        }

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long',
        });
    }

    /** Преобразует `DD.MM.YYYY` в `YYYY-MM-DD` для API. */
    private toApiDate(value: string): string | null {
        if (!value) {
            return null;
        }

        const parts = value.split('.');

        if (parts.length !== 3) {
            return null;
        }

        const [day, month, year] = parts;

        return `${year}-${month}-${day}`;
    }

    /** Фильтры по умолчанию: последние 7 дней, включая сегодняшний. */
    private defaultFilters(): OrderReportFilters {
        const today = new Date();
        const weekAgo = new Date(today);

        weekAgo.setDate(today.getDate() - 6);

        return {
            date_from: this.toDisplayDate(weekAgo),
            date_to: this.toDisplayDate(today),
            manager_id: null,
            account_id: null,
        };
    }

    /** Преобразует дату в `DD.MM.YYYY` для поля календаря. */
    private toDisplayDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        return `${day}.${month}.${date.getFullYear()}`;
    }

    /** Дата для имени файла выгрузки: `YYYY-MM-DD`. */
    private toFileDate(): string {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');

        return `${today.getFullYear()}-${month}-${day}`;
    }
}
