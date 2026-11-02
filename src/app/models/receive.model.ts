import { StoreModel } from './store.model';
import { SupplierModel } from './supplier.model';
import { UserShort } from './users/user-short.model';
import { ReceiveProductModel } from './receive-product.model';

export interface ReceiveModel {
    id: number;
    comment: string | null;
    payed: number;
    user: UserShort;
    store: StoreModel;
    supplier: SupplierModel | null;
    products: ReceiveProductModel[];
    total_count: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}
