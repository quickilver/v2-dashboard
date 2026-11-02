import { ProductIndex } from './products/product-short.model';
import { PriceModel } from './price.model';

export interface ReceiveProductModel {
    product: ProductIndex;
    price: PriceModel | null;
    count: number;
    purchase_price: number;
    total: number;
    old_value: number | null;
    new_value: number | null;
}
