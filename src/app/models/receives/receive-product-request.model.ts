export interface ReceiveProductRequest {
    product_id: number;
    count: number;
    purchase_price: number;
    price_id?: number | null;
    new_value?: number | null;
}
