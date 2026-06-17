import { MetaModel } from '../../meta.model';
import { AttributeShortModel } from '../../attributes/attribute-short.model';

export interface AttributesIndexResponse {
    data: AttributeShortModel[];
    meta: MetaModel;
}
