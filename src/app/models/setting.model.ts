export interface SettingModel {
    id: number;
    title: string;
    alias: string;
    type: string;
    group: string | null;
    options: any | null;
    value: string | null;
    created_at: string;
    updated_at: string;
}
