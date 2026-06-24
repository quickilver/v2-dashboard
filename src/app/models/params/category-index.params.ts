export interface CategoryIndexParams {
    page?: number;
    per_page?: number;
    query?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    parent_id?: number | null;
}
