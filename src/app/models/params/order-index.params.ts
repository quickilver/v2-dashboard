export interface OrderIndexParams {
    page?: number;
    per_page?: number;
    query?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    account_id?: number | null;
    product_id?: number | null;
    date_from?: string | null;
    date_to?: string | null;
}
