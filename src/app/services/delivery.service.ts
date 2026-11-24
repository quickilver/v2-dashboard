import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { DeliveryModel } from '../models/delivery.model';
import { DeliveryIndexParams } from '../models/params/delivery-index.params';
import { DeliveriesIndexResponse } from '../models/responses/deliveries/deliveries-index.response';
import { DeliveriesShowResponse } from '../models/responses/deliveries/deliveries-show.response';
import { DeliveriesCreateResponse } from '../models/responses/deliveries/deliveries-create.response';
import { DeliveriesUpdateResponse } from '../models/responses/deliveries/deliveries-update.response';

@Injectable({
    providedIn: 'root',
})
export class DeliveryService {
    private readonly apiUrl: string = `${environment.apiUrl}/deliveries/`;

    constructor(private http: HttpClient) {}

    async index(params?: DeliveryIndexParams): Promise<DeliveriesIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<DeliveriesIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<DeliveriesShowResponse> {
        return firstValueFrom(this.http.get<DeliveriesShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<DeliveryModel>): Promise<DeliveriesCreateResponse> {
        return firstValueFrom(this.http.post<DeliveriesCreateResponse>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<DeliveryModel>): Promise<DeliveriesUpdateResponse> {
        return firstValueFrom(this.http.put<DeliveriesUpdateResponse>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
