import { MetaModel } from '../../meta.model';
import { StatusModel } from '../../status.model';

export interface StatusesIndexResponse {
    data: StatusModel[];
    meta: MetaModel;
}
