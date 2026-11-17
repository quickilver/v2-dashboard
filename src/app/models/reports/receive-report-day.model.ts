import { ReceiveModel } from '../receive.model';

export interface ReceiveReportDay {
    /** Дата в формате `YYYY-MM-DD`. */
    date: string;
    /** Подпись дня для интерфейса. */
    label: string;
    receives: ReceiveModel[];
    totalPrice: number;
    totalCount: number;
}
