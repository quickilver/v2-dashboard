export interface ProductPriceFilter {
    id: number;
    min: number | null;
    max: number | null;
}

export interface ProductAttributeFilter {
    id: number;
    values: number[];
}

export interface ProductFilters {
    query: string;
    categories: number[];
    stores: number[];
    prices: ProductPriceFilter[];
    attributes: ProductAttributeFilter[];
}
