import type { ProductAttributeFilter } from './product-attribute-filter.model';
import type { ProductPriceFilter } from './product-price-filter.model';

export interface ProductFilters {
    query: string;
    categories: number[];
    stores: number[];
    prices: ProductPriceFilter[];
    attributes: ProductAttributeFilter[];
}
