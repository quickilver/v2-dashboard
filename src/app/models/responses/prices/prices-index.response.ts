import { MetaModel } from '../../meta.model';
import { PriceModel } from '../../price.model';

export interface PricesIndexResponse {
    data: PriceModel[];
    meta: MetaModel;
}