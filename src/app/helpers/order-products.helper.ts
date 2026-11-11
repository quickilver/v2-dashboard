import { ProductIndex } from '../models/products/product-short.model';

export function getProductCount(counts: Record<number, number>, productId: number): number {
    return counts[productId] ?? 1;
}

export function getProductAmount(amounts: Record<number, number>, productId: number): number {
    const amount = Number(amounts[productId] ?? 0);

    return Number.isFinite(amount) ? amount : 0;
}

export function getProductTotal(
    counts: Record<number, number>,
    amounts: Record<number, number>,
    productId: number,
): number {
    return getProductAmount(amounts, productId) * getProductCount(counts, productId);
}

export function getProductsTotal(
    products: ProductIndex[],
    counts: Record<number, number>,
    amounts: Record<number, number>,
): number {
    return products.reduce((sum, product) => sum + getProductTotal(counts, amounts, product.id), 0);
}
