import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal,
} from '@angular/core';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { IconComponent } from '../../../icon/icon';
import { ReceiveReportsFiltersComponent } from '../receive-reports-filters/receive-reports-filters';
import { ReceivesEditorComponent } from '../../receives/receives-editor/receives-editor';
import { ReceiveService } from '../../../../services/receive.service';
import { ReportService } from '../../../../services/report.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { ReceiveModel } from '../../../../models/receive.model';
import { ReceiveReportFilters } from '../../../../models/reports/receive-report-filters.model';
import { ReceiveReportDay } from '../../../../models/reports/receive-report-day.model';

@Component({
    selector: 'app-receive-reports',
    standalone: true,
    imports: [ReceiveReportsFiltersComponent, SkeletonComponent, IconComponent],
    templateUrl: './receive-reports.html',
    styleUrl: './receive-reports.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiveReportsComponent implements OnInit {
    private readonly receiveService = inject(ReceiveService);
    private readonly reportService = inject(ReportService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    readonly filters = signal<ReceiveReportFilters>(this.defaultFilters());

    readonly receives = signal<ReceiveModel[]>([]);
    readonly loading = signal<boolean>(false);
    readonly exporting = signal<boolean>(false);
    readonly collapsedDays = signal<Record<string, boolean>>({});
    readonly expandedProducts = signal<Record<number, boolean>>({});

    readonly days = computed<ReceiveReportDay[]>(() => this.groupByDay(this.receives()));

    readonly totalPrice = computed<number>(() =>
        this.receives().reduce((sum, receive) => sum + receive.total_price, 0),
    );

    readonly totalCount = computed<number>(() =>
        this.receives().reduce((sum, receive) => sum + receive.total_count, 0),
    );

    ngOnInit(): void {
        this.loadReceives();
    }

    async loadReceives(): Promise<void> {
        this.loading.set(true);

        try {
            const filters = this.filters();
            const response = await this.receiveService.index({
                per_page: 100,
                sort: 'created_at',
                direction: 'desc',
                store_id: filters.store_id,
                supplier_id: filters.supplier_id,
                user_id: filters.user_id,
                date_from: this.toApiDate(filters.date_from),
                date_to: this.toApiDate(filters.date_to),
            });

            this.receives.set(response.data);
        } catch {
            this.receives.set([]);
            this.notificationService.error('Не удалось загрузить поступления для отчёта');
        } finally {
            this.loading.set(false);
        }
    }

    onFiltersChange(filters: ReceiveReportFilters): void {
        this.filters.set(filters);
        this.loadReceives();
    }

    openReceive(receive: ReceiveModel): void {
        this.popupService
            .open(
                `Поступление №${receive.id}`,
                ReceivesEditorComponent,
                { id: receive.id },
                'with-tabs',
            )
            .then(() => this.loadReceives());
    }

    async exportToExcel(): Promise<void> {
        this.exporting.set(true);

        try {
            const blob = await this.reportService.exportReceives(this.filters());
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `receives-report-${this.toFileDate()}.xlsx`;
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

    isProductsExpanded(receiveId: number): boolean {
        return this.expandedProducts()[receiveId] ?? false;
    }

    toggleProducts(receiveId: number): void {
        this.expandedProducts.update((receives) => ({
            ...receives,
            [receiveId]: !receives[receiveId],
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

    private groupByDay(receives: ReceiveModel[]): ReceiveReportDay[] {
        const groups = new Map<string, ReceiveModel[]>();

        for (const receive of receives) {
            const date = this.toDayKey(receive.created_at);
            const dayReceives = groups.get(date) ?? [];

            dayReceives.push(receive);
            groups.set(date, dayReceives);
        }

        return Array.from(groups.entries())
            .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
            .map(([date, dayReceives]) => ({
                date,
                label: this.formatDayLabel(date),
                receives: dayReceives,
                totalPrice: dayReceives.reduce((sum, receive) => sum + receive.total_price, 0),
                totalCount: dayReceives.reduce((sum, receive) => sum + receive.total_count, 0),
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
    private defaultFilters(): ReceiveReportFilters {
        const today = new Date();
        const weekAgo = new Date(today);

        weekAgo.setDate(today.getDate() - 6);

        return {
            date_from: this.toDisplayDate(weekAgo),
            date_to: this.toDisplayDate(today),
            store_id: null,
            supplier_id: null,
            user_id: null,
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
