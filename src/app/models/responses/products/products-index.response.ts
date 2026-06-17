import { MetaModel } from '../../meta.model';
import { ProductShort } from '../../products/product-short.model';

export interface ProductsIndexResponse {
    data: ProductShort[];
    meta: MetaModel;
}
