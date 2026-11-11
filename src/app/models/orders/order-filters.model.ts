export interface OrderFilters {
    query: string;
    account_id: number | null;
    product_id: number | null;
    date_from: string;
    date_to: string;
}
