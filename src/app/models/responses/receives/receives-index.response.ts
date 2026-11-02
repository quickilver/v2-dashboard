import { MetaModel } from '../../meta.model';
import { ReceiveModel } from '../../receive.model';

export interface ReceivesIndexResponse {
    data: ReceiveModel[];
    meta: MetaModel;
}
