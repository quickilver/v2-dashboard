import type { ProductPictureShort } from './product-picture-short.model';

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
