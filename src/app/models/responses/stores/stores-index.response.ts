import { MetaModel } from '../../meta.model';
import { StoreModel } from '../../store.model';

export interface StoresIndexResponse {
    data: StoreModel[];
    meta: MetaModel;
}
