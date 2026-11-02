import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { CounterFieldComponent } from '../../../fields/counter-field/counter-field';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { ProductIndex } from '../../../../models/products/product-short.model';

@Component({
    selector: 'app-receive-products-list',
    standalone: true,
    imports: [CounterFieldComponent, InputFieldComponent],
    templateUrl: './receive-products-list.html',
    styleUrl: './receive-products-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiveProductsListComponent {
    products = input<ProductIndex[]>([]);
    counts = model<Record<number, number>>({});
    purchases = model<Record<number, number>>({});
    newPrices = model<Record<number, number>>({});
    productRemoved = output<ProductIndex>();

    totalCount = computed<number>(() =>
        this.products().reduce((sum, product) => sum + this.getCount(product.id), 0),
    );

    totalPrice = computed<number>(() =>
        this.products().reduce((sum, product) => sum + this.getTotal(product.id), 0),
    );

    formattedTotalPrice = computed<string>(() => this.formatAmount(this.totalPrice()));

    getCount(productId: number): number {
        return this.counts()[productId] ?? 1;
    }

    onCountChange(productId: number, count: number): void {
        this.counts.update((counts) => ({ ...counts, [productId]: count }));
    }

    getPurchase(productId: number): number | string {
        return this.purchases()[productId] ?? '';
    }

    onPurchaseChange(productId: number, value: string | number): void {
        const amount: number = Number(value);
        this.purchases.update((purchases) => ({
            ...purchases,
            [productId]: Number.isFinite(amount) ? amount : 0,
        }));
    }

    getTotal(productId: number): number {
        const purchase: number = Number(this.purchases()[productId] ?? 0);
        const count: number = this.getCount(productId);

        if (!Number.isFinite(purchase)) {
            return 0;
        }

        return purchase * count;
    }

    getNewPrice(productId: number): number | string {
        return this.newPrices()[productId] ?? '';
    }

    onNewPriceChange(productId: number, value: string | number): void {
        const amount: number = Number(value);
        this.newPrices.update((newPrices) => ({
            ...newPrices,
            [productId]: Number.isFinite(amount) ? amount : 0,
        }));
    }

    formatTotal(productId: number): string {
        return this.formatAmount(this.getTotal(productId));
    }

    private formatAmount(amount: number): string {
        return amount.toLocaleString('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    onRemove(product: ProductIndex): void {
        this.productRemoved.emit(product);
    }
}
