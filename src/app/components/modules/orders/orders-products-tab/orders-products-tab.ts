import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CounterFieldComponent } from '../../../fields/counter-field/counter-field';
import { ProductsListFieldComponent } from '../../../fields/products-list-field/products-list-field';
import { ProductIndex } from '../../../../models/products/product-short.model';
import {
    getProductAmount,
    getProductCount,
    getProductTotal,
    getProductsTotal,
} from '../../../../helpers/order-products.helper';

@Component({
    selector: 'app-orders-products-tab',
    standalone: true,
    imports: [InputFieldComponent, CounterFieldComponent, ProductsListFieldComponent],
    templateUrl: './orders-products-tab.html',
    styleUrl: './orders-products-tab.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersProductsTabComponent {
    products = model.required<ProductIndex[]>();
    counts = model<Record<number, number>>({});
    amounts = model<Record<number, number>>({});

    productsCount = computed<number>(() => this.products().length);

    totalPrice = computed<number>(() =>
        getProductsTotal(this.products(), this.counts(), this.amounts()),
    );

    onProductSelected(product: ProductIndex): void {
        if (this.products().some((item) => item.id === product.id)) {
            return;
        }

        this.products.update((items) => [...items, product]);
        this.counts.update((counts) => ({ ...counts, [product.id]: 1 }));
        this.amounts.update((amounts) => ({ ...amounts, [product.id]: 0 }));
    }

    onProductRemoved(product: ProductIndex): void {
        this.products.update((items) => items.filter((item) => item.id !== product.id));
    }

    getCount(productId: number): number {
        return getProductCount(this.counts(), productId);
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
        return getProductTotal(this.counts(), this.amounts(), productId);
    }
}
