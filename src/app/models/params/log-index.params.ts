export interface LogIndexParams {
    page?: number;
    per_page?: number;
    event?: 'updated' | 'created' | 'deleted' | 'restored';
    model_type?: string;
    user_id?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}