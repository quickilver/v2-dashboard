import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductsIndexResponse } from '../models/responses/products/products-index.response';
import { ProductsShowResponse } from '../models/responses/products/products-show.response';

export interface ProductIndexParams {
    page?: number;
    per_page?: number;
    query?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private readonly apiUrl: string = `${environment.apiUrl}/products/`;

    constructor(private http: HttpClient) {}

    async index(params?: ProductIndexParams): Promise<ProductsIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('search', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<ProductsIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<ProductsShowResponse> {
        return firstValueFrom(this.http.get<ProductsShowResponse>(`${this.apiUrl}${id}`));
    }
}
