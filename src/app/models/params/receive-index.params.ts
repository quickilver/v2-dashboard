export interface ReceiveIndexParams {
    page?: number;
    per_page?: number;
    query?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    store_id?: number | null;
    supplier_id?: number | null;
    user_id?: number | null;
    date_from?: string | null;
    date_to?: string | null;
}
