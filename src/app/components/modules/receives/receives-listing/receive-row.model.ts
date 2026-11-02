import { SupplierModel } from '../../../../models/supplier.model';
import { UserShort } from '../../../../models/users/user-short.model';

export interface ReceiveRow {
    id: number;
    store: string;
    supplier: SupplierModel | null;
    user: UserShort | null;
    total_count: number;
    total_price: string;
    created_at: string;
}
