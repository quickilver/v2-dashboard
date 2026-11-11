import { ProductIndex } from '../models/products/product-short.model';

export class OrderProductsHelper {
    static getCount(counts: Record<number, number>, productId: number): number {
        return counts[productId] ?? 1;
    }

    static getAmount(amounts: Record<number, number>, productId: number): number {
        const amount = Number(amounts[productId] ?? 0);

        return Number.isFinite(amount) ? amount : 0;
    }

    static getTotal(
        counts: Record<number, number>,
        amounts: Record<number, number>,
        productId: number,
    ): number {
        return (
            OrderProductsHelper.getAmount(amounts, productId) *
            OrderProductsHelper.getCount(counts, productId)
        );
    }

    static getProductsTotal(
        products: ProductIndex[],
        counts: Record<number, number>,
        amounts: Record<number, number>,
    ): number {
        return products.reduce(
            (sum, product) => sum + OrderProductsHelper.getTotal(counts, amounts, product.id),
            0,
        );
    }
}
