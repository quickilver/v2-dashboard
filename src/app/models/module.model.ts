export interface ModuleModel {
    id: number;
    title: string;
    path: string;
    icon: string;
    parent_id: number | null;
    position: number;
    children?: ModuleModel[];
    created_at: string;
    updated_at: string;
}
