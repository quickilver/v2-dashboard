import { OrderModel } from '../order.model';

export interface OrderReportDay {
    /** Дата в формате `YYYY-MM-DD`. */
    date: string;
    /** Подпись дня для интерфейса. */
    label: string;
    orders: OrderModel[];
    totalPrice: number;
    totalCount: number;
}
