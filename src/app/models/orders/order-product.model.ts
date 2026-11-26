export interface OrderProductModel {
    id: number;
    product: {
        id: number;
        title: string;
        sku: string;
    } | null;
    title: string;
    amount: number;
    count: number;
    total: number;
}
