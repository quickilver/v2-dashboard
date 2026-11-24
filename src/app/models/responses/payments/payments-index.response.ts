import { MetaModel } from '../../meta.model';
import { PaymentModel } from '../../payment.model';

export interface PaymentsIndexResponse {
    data: PaymentModel[];
    meta: MetaModel;
}
