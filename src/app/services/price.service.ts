import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { PricesIndexResponse } from '../models/responses/prices/prices-index.response';
import { PricesShowResponse } from '../models/responses/prices/prices-show.response';
import { PriceModel } from '../models/price.model';
import { PriceIndexParams } from '../models/params/price-index.params';

@Injectable({
    providedIn: 'root',
})
export class PriceService {
    private readonly apiUrl: string = `${environment.apiUrl}/prices/`;

    constructor(private http: HttpClient) {}

    async index(params?: PriceIndexParams): Promise<PricesIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<PricesIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<PricesShowResponse> {
        return firstValueFrom(this.http.get<PricesShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<PriceModel>): Promise<PriceModel> {
        return firstValueFrom(this.http.post<PriceModel>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<PriceModel>): Promise<PriceModel> {
        return firstValueFrom(this.http.put<PriceModel>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
