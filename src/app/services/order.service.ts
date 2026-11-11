import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    OrdersIndexResponse,
    OrdersShowResponse,
} from '../models/responses/orders/orders-index.response';
import { OrderIndexParams } from '../models/params/order-index.params';
import { OrderCreateRequest } from '../models/orders/order-create-request.model';

@Injectable({
    providedIn: 'root',
})
export class OrderService {
    private readonly apiUrl: string = `${environment.apiUrl}/orders/`;

    constructor(private http: HttpClient) {}

    async index(params?: OrderIndexParams): Promise<OrdersIndexResponse> {
        let httpParams = new HttpParams();

        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
            if (params.account_id) httpParams = httpParams.set('account_id', params.account_id);
            if (params.product_id) httpParams = httpParams.set('product_id', params.product_id);
            if (params.date_from) httpParams = httpParams.set('date_from', params.date_from);
            if (params.date_to) httpParams = httpParams.set('date_to', params.date_to);
        }

        return firstValueFrom(
            this.http.get<OrdersIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<OrdersShowResponse> {
        return firstValueFrom(this.http.get<OrdersShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: OrderCreateRequest): Promise<OrdersShowResponse> {
        return firstValueFrom(this.http.post<OrdersShowResponse>(this.apiUrl, data));
    }

    async update(id: number, data: OrderCreateRequest): Promise<OrdersShowResponse> {
        return firstValueFrom(this.http.put<OrdersShowResponse>(`${this.apiUrl}${id}`, data));
    }
}
