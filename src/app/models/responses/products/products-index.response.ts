import { MetaModel } from '../../meta.model';
import { ProductIndex } from '../../products/product-short.model';

export interface ProductsIndexResponse {
    data: ProductIndex[];
    meta: MetaModel;
}
