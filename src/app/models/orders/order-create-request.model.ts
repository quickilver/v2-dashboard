export interface OrderProductRequest {
    product_id: number | null;
    title: string;
    amount: number;
    count: number;
}

export interface OrderCreateRequest {
    number?: string | null;
    account_id?: number | null;
    status_id?: number | null;
    contact_phone?: number | null;
    contact_email?: string | null;
    contact_first_name?: string | null;
    contact_last_name?: string | null;
    contact_middle_name?: string | null;
    comment?: string | null;
    products?: OrderProductRequest[];
}
