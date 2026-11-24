import { MetaModel } from '../../meta.model';
import { DeliveryModel } from '../../delivery.model';

export interface DeliveriesIndexResponse {
    data: DeliveryModel[];
    meta: MetaModel;
}
