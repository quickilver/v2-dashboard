import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentModel } from '../models/payment.model';
import { PaymentIndexParams } from '../models/params/payment-index.params';
import { PaymentsIndexResponse } from '../models/responses/payments/payments-index.response';
import { PaymentsShowResponse } from '../models/responses/payments/payments-show.response';
import { PaymentsCreateResponse } from '../models/responses/payments/payments-create.response';
import { PaymentsUpdateResponse } from '../models/responses/payments/payments-update.response';

@Injectable({
    providedIn: 'root',
})
export class PaymentService {
    private readonly apiUrl: string = `${environment.apiUrl}/payments/`;

    constructor(private http: HttpClient) {}

    async index(params?: PaymentIndexParams): Promise<PaymentsIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<PaymentsIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<PaymentsShowResponse> {
        return firstValueFrom(this.http.get<PaymentsShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<PaymentModel>): Promise<PaymentsCreateResponse> {
        return firstValueFrom(this.http.post<PaymentsCreateResponse>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<PaymentModel>): Promise<PaymentsUpdateResponse> {
        return firstValueFrom(this.http.put<PaymentsUpdateResponse>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
