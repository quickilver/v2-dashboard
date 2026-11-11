import { ProductAttributeValueRequest } from './product-attribute-value-request.model';
import { ProductPriceRequest } from './product-price-request.model';
import { ProductStoreRequest } from './product-store-request.model';

export interface ProductCreateRequest {
    title: string;
    sku: string;
    description?: string | null;
    categories: number[];
    attribute_values: ProductAttributeValueRequest[];
    prices: ProductPriceRequest[];
    stores: ProductStoreRequest[];
}
