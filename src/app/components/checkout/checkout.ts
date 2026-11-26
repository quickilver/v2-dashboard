import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { PaymentModel } from '../../models/payment.model';
import { AccountModel } from '../../models/account.model';
import { ProductIndex } from '../../models/products/product-short.model';
import { OrderCreateRequest } from '../../models/orders/order-create-request.model';
import type { OrderProductRequest } from '../../models/orders/order-product-request.model';
import { OrderProductsHelper } from '../../helpers/order-products.helper';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PopupService } from '../../services/popup.service';
import { OrderService } from '../../services/order.service';
import { AutocompleteAccountsFieldComponent } from '../fields/autocomplete-accounts-field/autocomplete-accounts-field';
import { OrderReportsComponent } from '../modules/reports/order-reports/order-reports';
import { OrdersProductsTabComponent } from '../modules/orders/orders-products-tab/orders-products-tab';
import type { CheckoutDraft } from '../../models/checkout/checkout-draft.model';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [AutocompleteAccountsFieldComponent, OrdersProductsTabComponent, OrderReportsComponent],
    templateUrl: './checkout.html',
    styleUrl: './checkout.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
    private readonly orderService = inject(OrderService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly authService = inject(AuthService);
    private readonly storageKey = this.checkoutStorageKey();
    private draftStarted = false;
    private orderCreated = false;
    private lastWrittenDraft: string | null = null;
    private readonly savedDraft = signal<CheckoutDraft | null>(this.readDraft());
    readonly canResumeDraft = computed<boolean>(() => this.savedDraft() !== null);

    readonly payments = signal<Pick<PaymentModel, 'id' | 'title'>[]>([]);
    readonly paymentId = signal<number | null>(null);
    readonly paymentsLoading = signal<boolean>(true);
    readonly paymentsError = signal<boolean>(false);

    readonly buyerSearch = signal<string>('');
    readonly buyer = signal<AccountModel | null>(null);
    readonly products = signal<ProductIndex[]>([]);
    readonly counts = signal<Record<number, number>>({});
    readonly amounts = signal<Record<number, number>>({});

    readonly pendingPrices = signal<number>(0);
    readonly saving = signal<boolean>(false);

    readonly canSubmit = computed<boolean>(
        () =>
            this.paymentId() !== null &&
            this.products().length > 0 &&
            this.pendingPrices() === 0 &&
            !this.saving(),
    );

    constructor() {
        effect(() => this.persistDraft());
        this.destroyRef.onDestroy(() => this.persistDraft());
    }

    ngOnInit(): void {
        void this.loadPayments();
    }

    resumeDraft(): void {
        const draft: CheckoutDraft | null = this.savedDraft();
        if (!draft) return;

        this.draftStarted = true;
        this.savedDraft.set(null);
        this.buyer.set(draft.buyer);
        this.buyerSearch.set(draft.buyerSearch);
        this.products.set(draft.products);
        this.counts.set(draft.counts);
        this.amounts.set(draft.amounts);

        const options = this.payments();
        if (this.paymentsLoading() || options.some((payment) => payment.id === draft.paymentId)) {
            this.paymentId.set(draft.paymentId);
        } else {
            this.paymentId.set(options[0]?.id ?? null);
        }
    }

    private checkoutStorageKey(): string | null {
        const userId: number | undefined = this.authService.user()?.id;
        return userId === undefined ? null : `checkout-draft:v1:${userId}`;
    }

    private readDraft(): CheckoutDraft | null {
        if (!this.storageKey) return null;

        try {
            const raw: string | null = localStorage.getItem(this.storageKey);
            if (!raw) return null;

            const draft: CheckoutDraft | null = JSON.parse(raw);
            if (
                !draft ||
                typeof draft.buyerSearch !== 'string' ||
                !Array.isArray(draft.products) ||
                !draft.counts ||
                !draft.amounts
            ) {
                return null;
            }

            this.lastWrittenDraft = raw;
            return draft;
        } catch {
            return null;
        }
    }

    private persistDraft(): void {
        if (!this.storageKey || this.orderCreated) return;

        const paymentId: number | null = this.paymentId();
        const buyerSearch: string = this.buyerSearch();
        const buyer: AccountModel | null = this.buyer();
        const products: ProductIndex[] = this.products();
        const counts: Record<number, number> = this.counts();
        const amounts: Record<number, number> = this.amounts();
        const hasInput: boolean =
            !!buyer ||
            buyerSearch.trim() !== '' ||
            products.length > 0 ||
            (paymentId !== null && paymentId !== this.payments()[0]?.id);

        if (!hasInput) {
            if (this.draftStarted) this.clearStoredDraft();
            return;
        }

        this.draftStarted = true;
        this.savedDraft.set(null);

        const draft: CheckoutDraft = {
            paymentId,
            buyerSearch,
            buyer,
            products,
            counts: Object.fromEntries(
                products.map(({ id }) => [id, OrderProductsHelper.getCount(counts, id)]),
            ),
            amounts: Object.fromEntries(
                products.map(({ id }) => [id, OrderProductsHelper.getAmount(amounts, id)]),
            ),
        };

        try {
            const value: string = JSON.stringify(draft);
            localStorage.setItem(this.storageKey, value);
            this.lastWrittenDraft = value;
        } catch {
            // Storage can be unavailable in private mode or when the quota is exceeded.
        }
    }

    private clearStoredDraft(): void {
        if (!this.storageKey || this.lastWrittenDraft === null) return;

        try {
            if (localStorage.getItem(this.storageKey) === this.lastWrittenDraft) {
                localStorage.removeItem(this.storageKey);
            }
            this.lastWrittenDraft = null;
        } catch {
            // Storage may be blocked by the browser.
        }
    }

    cancel(): void {
        if (!this.saving()) {
            this.popupService.resolve();
        }
    }

    async submit(): Promise<void> {
        if (!this.canSubmit()) return;

        const counts: Record<number, number> = this.counts();
        const amounts: Record<number, number> = this.amounts();
        const products: OrderProductRequest[] = [];

        for (const product of this.products()) {
            const count: number = OrderProductsHelper.getCount(counts, product.id);
            const amount: number = OrderProductsHelper.getAmount(amounts, product.id);

            if (!Number.isInteger(count) || count < 1 || count > (product.total_count ?? 0)) {
                this.notificationService.error(`Проверьте количество товара «${product.title}»`);
                return;
            }

            if (!Number.isInteger(amount) || amount < 0) {
                this.notificationService.error(`Проверьте цену товара «${product.title}»`);
                return;
            }

            products.push({ product_id: product.id, title: product.title, amount, count });
        }

        const buyer: AccountModel | null = this.buyer();
        const payload: OrderCreateRequest = {
            payment_id: this.paymentId(),
            account_id: buyer?.id ?? null,
            contact_first_name: buyer?.first_name ?? null,
            contact_last_name: buyer?.last_name ?? null,
            contact_middle_name: buyer?.middle_name ?? null,
            contact_phone: buyer?.phone ?? null,
            contact_email: buyer?.email ?? null,
            products,
        };

        this.saving.set(true);
        try {
            const { data } = await this.orderService.create(payload);
            this.orderCreated = true;
            this.clearStoredDraft();
            this.notificationService.success(`Заказ №${data.number} оформлен`);
            if (!this.destroyRef.destroyed) {
                this.popupService.resolve();
            }
        } catch (error: unknown) {
            const message: unknown = error instanceof HttpErrorResponse ? error.error?.message : null;
            this.notificationService.error(
                typeof message === 'string' ? message : 'Не удалось оформить заказ',
            );
        } finally {
            this.saving.set(false);
        }
    }

    private async loadPayments(): Promise<void> {
        try {
            const { data } = await this.orderService.paymentOptions();
            this.payments.set(data);
            const currentPaymentId: number | null = this.paymentId();
            if (!data.some((payment) => payment.id === currentPaymentId)) {
                this.paymentId.set(data[0]?.id ?? null);
            }
        } catch {
            this.paymentsError.set(true);
        } finally {
            this.paymentsLoading.set(false);
        }
    }
}
