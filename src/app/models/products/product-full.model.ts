import { Category } from '../category.model';
import { ProductAttribute } from './product-attribute.model';
import { ProductPrice } from './product-price.model';
import { ProductStore } from './product-store.model';

export interface ProductFull {
    id: number;
    guid: string;
    title: string;
    sku: string;
    description: string;
    display: boolean;
    categories: Category[];
    attribute: ProductAttribute[];
    prices: ProductPrice[];
    stores: ProductStore[];
    pictures: string[];
    created_at: string;
    updated_at: string;
}
