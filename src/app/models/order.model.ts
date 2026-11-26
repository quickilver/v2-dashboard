import { PaymentModel } from './payment.model';
import { DeliveryModel } from './delivery.model';
import { AccountModel } from './account.model';
import { StatusModel } from './status.model';
import type { OrderProductModel } from './orders/order-product.model';

export interface OrderModel {
    id: number;
    number: string;
    account: AccountModel | null;
    manager?: { id: number; name: string } | null;
    status: StatusModel | null;
    payment?: PaymentModel | null;
    delivery?: DeliveryModel | null;
    contact_phone: number | null;
    contact_email: string | null;
    contact_first_name: string | null;
    contact_last_name: string | null;
    contact_middle_name: string | null;
    comment: string | null;
    products: OrderProductModel[];
    total_count: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}
