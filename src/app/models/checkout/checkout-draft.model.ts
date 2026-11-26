import type { AccountModel } from '../account.model';
import type { ProductIndex } from '../products/product-short.model';

export interface CheckoutDraft {
    paymentId: number | null;
    buyerSearch: string;
    buyer: AccountModel | null;
    products: ProductIndex[];
    counts: Record<number, number>;
    amounts: Record<number, number>;
}
