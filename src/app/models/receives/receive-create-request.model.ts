import { ReceiveProductRequest } from './receive-product-request.model';

export interface ReceiveCreateRequest {
    store_id: number;
    supplier_id: number;
    comment?: string | null;
    payed?: number;
    products: ReceiveProductRequest[];
}
