export interface TaskIndexParams {
    page?: number;
    per_page?: number;
    query?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    group_id?: number;
    assigned_to?: number;
    root_only?: boolean;
}
