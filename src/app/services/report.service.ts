import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderReportFilters } from '../models/reports/order-report-filters.model';

@Injectable({
    providedIn: 'root',
})
export class ReportService {
    private readonly apiUrl: string = `${environment.apiUrl}/reports/`;

    constructor(private http: HttpClient) {}

    /**
     * Экспорт отчёта по продажам в XLSX.
     */
    async exportOrders(filters: OrderReportFilters): Promise<Blob> {
        let httpParams = new HttpParams();

        const dateFrom = this.toApiDate(filters.date_from);
        const dateTo = this.toApiDate(filters.date_to);

        if (dateFrom) httpParams = httpParams.set('date_from', dateFrom);
        if (dateTo) httpParams = httpParams.set('date_to', dateTo);
        if (filters.account_id) httpParams = httpParams.set('account_id', filters.account_id);

        return firstValueFrom(
            this.http.get(`${this.apiUrl}orders/export`, {
                params: httpParams,
                responseType: 'blob',
            }),
        );
    }

    /** Преобразует `DD.MM.YYYY` в `YYYY-MM-DD` для API. */
    private toApiDate(value: string): string | null {
        if (!value) {
            return null;
        }

        const parts = value.split('.');

        if (parts.length !== 3) {
            return null;
        }

        const [day, month, year] = parts;

        return `${year}-${month}-${day}`;
    }
}
