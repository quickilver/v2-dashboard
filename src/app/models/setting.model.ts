export interface SettingModel {
    id: number;
    title: string;
    alias: string;
    type: string;
    group_id: number | null;
    group?: {
        id: number;
        title: string;
        position: number;
    } | null;
    options: any | null;
    value: string | null;
    created_at: string;
    updated_at: string;
}
