import { MetaModel } from '../../meta.model';
import { SupplierModel } from '../../supplier.model';

export interface SuppliersIndexResponse {
    data: SupplierModel[];
    meta: MetaModel;
}
