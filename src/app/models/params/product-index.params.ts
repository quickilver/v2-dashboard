import type { ProductAttributeFilter } from '../products/product-attribute-filter.model';
import type { ProductPriceFilter } from '../products/product-price-filter.model';

export interface ProductIndexParams {
    page?: number;
    per_page?: number;
    query?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    categories?: number[];
    stores?: number[];
    prices?: ProductPriceFilter[];
    attributes?: ProductAttributeFilter[];
}
