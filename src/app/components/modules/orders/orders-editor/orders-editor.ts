import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { TextareaFieldComponent } from '../../../fields/textarea-field/textarea-field';
import { SelectFieldComponent, SelectOption } from '../../../fields/select-field/select-field';
import { OrderService } from '../../../../services/order.service';
import { StatusService } from '../../../../services/status.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { OrderModel } from '../../../../models/order.model';
import { AccountModel } from '../../../../models/account.model';
import { ProductIndex } from '../../../../models/products/product-short.model';
import { PhoneHelper } from '../../../../helpers/phone.helper';
import { OrderProductsHelper } from '../../../../helpers/order-products.helper';
import { OrdersAccountTabComponent } from '../orders-account-tab/orders-account-tab';
import { OrdersProductsTabComponent } from '../orders-products-tab/orders-products-tab';

@Component({
    selector: 'app-orders-editor',
    standalone: true,
    imports: [
        SkeletonComponent,
        TextareaFieldComponent,
        SelectFieldComponent,
        OrdersAccountTabComponent,
        OrdersProductsTabComponent,
    ],
    templateUrl: './orders-editor.html',
    styleUrl: './orders-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersEditorComponent implements OnInit {
    private readonly orderService = inject(OrderService);
    private readonly statusService = inject(StatusService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');
    order = signal<OrderModel | null>(null);

    accountSearch = model<string>('');
    selectedAccount = model<AccountModel | null>(null);

    contactPhone = model<string>('');
    contactEmail = model<string>('');
    contactFirstName = model<string>('');
    contactLastName = model<string>('');
    contactMiddleName = model<string>('');
    comment = model<string>('');
    statusId = model<number | null>(null);

    statusOptions = signal<SelectOption[]>([]);

    products = signal<ProductIndex[]>([]);
    counts = signal<Record<number, number>>({});
    amounts = signal<Record<number, number>>({});

    productsCount = computed<number>(() => this.products().length);

    totalPrice = computed<number>(() =>
        OrderProductsHelper.getProductsTotal(this.products(), this.counts(), this.amounts()),
    );

    accountName = computed<string>(() => {
        const account = this.order()?.account;
        if (!account) return '';

        return [account.last_name, account.first_name, account.middle_name]
            .filter((part) => !!part)
            .join(' ');
    });

    ngOnInit(): void {
        const orderId = this.id();

        if (orderId) {
            this.isEditMode.set(true);
            this.loadOrder(orderId);
        } else {
            this.loadStatuses();
        }
    }

    private async loadStatuses(): Promise<void> {
        try {
            const response = await this.statusService.index({ per_page: 100 });
            this.statusOptions.set(
                response.data.map((status) => ({ label: status.title, value: status.id })),
            );
        } catch {
            this.statusOptions.set([]);
        }
    }

    private async loadOrder(id: number): Promise<void> {
        this.loading.set(true);

        try {
            const [response] = await Promise.all([this.orderService.show(id), this.loadStatuses()]);

            const order = response.data;
            this.order.set(order);

            this.selectedAccount.set(order.account);
            this.accountSearch.set(this.accountName());
            this.statusId.set(order.status?.id ?? null);
            this.contactPhone.set(
                order.contact_phone ? PhoneHelper.format(order.contact_phone) : '',
            );
            this.contactEmail.set(order.contact_email ?? '');
            this.contactFirstName.set(order.contact_first_name ?? '');
            this.contactLastName.set(order.contact_last_name ?? '');
            this.contactMiddleName.set(order.contact_middle_name ?? '');
            this.comment.set(order.comment ?? '');

            const products: ProductIndex[] = [];
            const counts: Record<number, number> = {};
            const amounts: Record<number, number> = {};

            for (const item of order.products) {
                if (!item.product) {
                    continue;
                }

                products.push(item.product as ProductIndex);
                counts[item.product.id] = item.count;
                amounts[item.product.id] = item.amount;
            }

            this.products.set(products);
            this.counts.set(counts);
            this.amounts.set(amounts);
        } catch {
            this.notificationService.error('Не удалось загрузить заказ');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        const payload = {
            account_id: this.selectedAccount()?.id ?? null,
            status_id: this.statusId(),
            contact_phone: PhoneHelper.toNumber(this.contactPhone()),
            contact_email: this.contactEmail().trim() || null,
            contact_first_name: this.contactFirstName().trim() || null,
            contact_last_name: this.contactLastName().trim() || null,
            contact_middle_name: this.contactMiddleName().trim() || null,
            comment: this.comment().trim() || null,
            products: this.products().map((product) => ({
                product_id: product.id,
                title: product.title,
                amount: Number(this.amounts()[product.id] ?? 0),
                count: OrderProductsHelper.getCount(this.counts(), product.id),
            })),
        };

        try {
            if (this.isEditMode()) {
                await this.orderService.update(this.id()!, payload);
            } else {
                await this.orderService.create(payload);
            }

            this.notificationService.success(
                this.isEditMode() ? 'Заказ успешно сохранён' : 'Заказ успешно создан',
            );
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response?.error?.message ?? 'Ошибка при сохранении заказа',
            );
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }

    isActiveTab(tab: string): boolean {
        return this.tab() === tab;
    }

    changeTab(tab: string): void {
        this.tab.set(tab);
    }

    formatDate(value: string | null): string {
        if (!value) return '—';

        return new Date(value).toLocaleString('ru-RU');
    }
}
