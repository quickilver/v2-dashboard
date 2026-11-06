export interface ProductPictureModel {
    id: number;
    path: string;
    url: string | null;
    preview: string;
    preview_url: string | null;
    is_main: boolean;
    display: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}