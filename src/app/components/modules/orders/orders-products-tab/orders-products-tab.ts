import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    model,
    signal,
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CounterFieldComponent } from '../../../fields/counter-field/counter-field';
import { ProductsListFieldComponent } from '../../../fields/products-list-field/products-list-field';
import { ProductIndex } from '../../../../models/products/product-short.model';
import { OrderProductsHelper } from '../../../../helpers/order-products.helper';
import { SettingService } from '../../../../services/setting.service';
import { ProductService } from '../../../../services/product.service';

const DEFAULT_PRICE_ALIAS = 'order-default-price-id';

@Component({
    selector: 'app-orders-products-tab',
    standalone: true,
    imports: [InputFieldComponent, CounterFieldComponent, ProductsListFieldComponent],
    templateUrl: './orders-products-tab.html',
    styleUrl: './orders-products-tab.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersProductsTabComponent implements OnInit {
    private readonly settingService = inject(SettingService);
    private readonly productService = inject(ProductService);

    products = model.required<ProductIndex[]>();
    counts = model<Record<number, number>>({});
    amounts = model<Record<number, number>>({});

    defaultPriceId = signal<number | null>(null);

    private defaultPriceIdPromise: Promise<number | null> | null = null;

    productsCount = computed<number>(() => this.products().length);

    totalPrice = computed<number>(() =>
        OrderProductsHelper.getProductsTotal(this.products(), this.counts(), this.amounts()),
    );

    ngOnInit(): void {
        this.defaultPriceIdPromise = this.loadDefaultPriceId();
    }

    /**
     * Загружает тип цены по умолчанию из настроек.
     */
    private async loadDefaultPriceId(): Promise<number | null> {
        try {
            const setting = await this.settingService.findByAlias(DEFAULT_PRICE_ALIAS);
            const priceId = Number(setting?.value);
            const resolvedPriceId = setting?.value && Number.isFinite(priceId) ? priceId : null;

            this.defaultPriceId.set(resolvedPriceId);

            return resolvedPriceId;
        } catch {
            this.defaultPriceId.set(null);

            return null;
        }
    }

    async onProductSelected(product: ProductIndex): Promise<void> {
        if (this.products().some((item) => item.id === product.id)) {
            return;
        }

        this.products.update((items) => [...items, product]);
        this.counts.update((counts) => ({ ...counts, [product.id]: 1 }));
        this.amounts.update((amounts) => ({ ...amounts, [product.id]: 0 }));

        const amount = await this.resolveDefaultAmount(product.id);

        if (amount === null || !this.products().some((item) => item.id === product.id)) {
            return;
        }

        this.amounts.update((amounts) => ({ ...amounts, [product.id]: amount }));
    }

    /**
     * Возвращает цену товара для типа цены по умолчанию.
     */
    private async resolveDefaultAmount(productId: number): Promise<number | null> {
        const priceId = this.defaultPriceIdPromise
            ? await this.defaultPriceIdPromise
            : this.defaultPriceId();

        if (priceId === null) {
            return null;
        }

        try {
            const response = await this.productService.show(productId);
            const price = response.data.prices.find((item) => item.id === priceId);

            return price ? Number(price.amount) : null;
        } catch {
            return null;
        }
    }

    onProductRemoved(product: ProductIndex): void {
        this.products.update((items) => items.filter((item) => item.id !== product.id));
    }

    getCount(productId: number): number {
        return OrderProductsHelper.getCount(this.counts(), productId);
    }

    onCountChange(productId: number, count: number): void {
        this.counts.update((counts) => ({ ...counts, [productId]: count }));
    }

    getAmount(productId: number): number | string {
        const amount = this.amounts()[productId];

        return amount === undefined ? '' : amount;
    }

    onAmountChange(productId: number, value: string | number): void {
        const amount = Number(value);

        this.amounts.update((amounts) => ({
            ...amounts,
            [productId]: Number.isFinite(amount) ? amount : 0,
        }));
    }

    getTotal(productId: number): number {
        return OrderProductsHelper.getTotal(this.counts(), this.amounts(), productId);
    }
}
