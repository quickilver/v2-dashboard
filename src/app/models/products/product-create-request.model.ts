export interface ProductAttributeValueRequest {
    id: number;
    position?: number;
}

export interface ProductPriceRequest {
    id: number;
    amount: number;
}

export interface ProductStoreRequest {
    id: number;
    count: number;
}

export interface ProductCreateRequest {
    title: string;
    sku: string;
    description?: string | null;
    categories: number[];
    attribute_values: ProductAttributeValueRequest[];
    prices: ProductPriceRequest[];
    stores: ProductStoreRequest[];
}