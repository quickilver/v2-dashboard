import { AccountModel } from './account.model';
import { StatusModel } from './status.model';

export interface OrderProductModel {
    id: number;
    product: {
        id: number;
        title: string;
        sku: string;
    } | null;
    title: string;
    amount: number;
    count: number;
    total: number;
}

export interface OrderModel {
    id: number;
    number: string;
    account: AccountModel | null;
    status: StatusModel | null;
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
