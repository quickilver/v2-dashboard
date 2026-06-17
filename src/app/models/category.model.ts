export interface Category {
    id: number;
    guid: string;
    title: string;
    alias: string;
    parent_id: number | null;
    display: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}
