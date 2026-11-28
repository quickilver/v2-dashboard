import type { GeneratedProductAttribute } from './generated-product-attribute.model';

export interface GeneratedProductMetadata {
    image_urls?: string[];
    description: string;
    attributes: GeneratedProductAttribute[];
}
