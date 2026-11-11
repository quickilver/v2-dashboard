import { MetaModel } from '../../meta.model';
import { OrderModel } from '../../order.model';

export interface OrdersIndexResponse {
    data: OrderModel[];
    meta: MetaModel;
}

export interface OrdersShowResponse {
    data: OrderModel;
}
