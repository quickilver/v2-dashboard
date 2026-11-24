import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { PaymentService } from '../../../../services/payment.service';
import { PaymentModel } from '../../../../models/payment.model';
import { PaymentsIndexResponse } from '../../../../models/responses/payments/payments-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { PaymentIndexParams } from '../../../../models/params/payment-index.params';
import { PaymentsEditorComponent } from '../payments-editor/payments-editor';

@Component({
    selector: 'app-payments-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './payments-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsListingComponent implements OnInit {
    private readonly paymentService = inject(PaymentService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px', isDefault: true },
        { key: 'position', title: 'Позиция', sortable: true, width: '100px', isDefault: true },
        { key: 'title', title: 'Название', sortable: true, isDefault: true },
        { key: 'description', title: 'Описание', sortable: false, isDefault: true },
    ]);

    columnsStorageKey = 'payments';

    payments = signal<PaymentModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = 'position';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadPayments();
    }

    async loadPayments(): Promise<void> {
        this.loading.set(true);
        try {
            const params: PaymentIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.currentSearch,
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: PaymentsIndexResponse = await this.paymentService.index(params);
            this.payments.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке способов оплаты');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(payment: PaymentModel): void {
        this.onEdit(payment);
    }

    onEdit(payment: PaymentModel): void {
        this.popupService
            .open('Редактирование способа оплаты', PaymentsEditorComponent, { id: payment.id })
            .then(() => {
                this.loadPayments();
            });
    }

    async onDelete(payment: PaymentModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление способа оплаты',
            `Вы уверены, что хотите удалить способа оплаты "${payment.title}"?`,
            'Удалить',
            'Отмена',
        );

        if (confirmed) {
            try {
                await this.paymentService.delete(payment.id);
                this.notificationService.success('Способ оплаты успешно удалён');
                this.loadPayments();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении способа оплаты');
            }
        }
    }

    createClick(duplicateFromId: number | null = null): void {
        this.popupService
            .open('Создание способа оплаты', PaymentsEditorComponent, { duplicateFromId })
            .then(() => {
                this.loadPayments();
            });
    }

    onSearch(query: string): void {
        this.currentSearch = query;
        this.page.set(1);
        this.loadPayments();
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadPayments();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadPayments();
    }

    onPageSizeChange(pageSize: number): void {
        this.pageSize.set(pageSize);
        this.page.set(1);
        this.loadPayments();
    }
}
