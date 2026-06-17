export interface Module {
    id: number;
    title: string;
    path: string;
    icon: string;
    parent_id: number | null;
    position: number;
    children?: Module[];
    created_at: string;
    updated_at: string;
}