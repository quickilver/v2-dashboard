export interface ProductPictureShort {
    id: number;
    path: string;
    url: string | null;
    preview: string;
    preview_url: string | null;
}

export interface ProductIndex {
    id: number;
    title: string;
    sku: string;
    description: string;
    display: boolean;
    picture: ProductPictureShort | null;
    total_count?: number;
    created_at: string;
    updated_at: string;
}
