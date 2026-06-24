import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category.model';
import { CategoriesIndexResponse } from '../models/responses/categories/categories-index.response';
import { CategoriesShowResponse } from '../models/responses/categories/categories-show.response';
import { CategoriesCreateResponse } from '../models/responses/categories/categories-create.response';
import { CategoriesUpdateResponse } from '../models/responses/categories/categories-update.response';
import { CategoryIndexParams } from '../models/params/category-index.params';

@Injectable({
    providedIn: 'root',
})
export class CategoriesService {
    private readonly apiUrl: string = `${environment.apiUrl}/categories/`;

    constructor(private http: HttpClient) {}

    async index(params?: CategoryIndexParams): Promise<CategoriesIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
            if (params.parent_id !== undefined)
                httpParams = httpParams.set('parent_id', params.parent_id ?? '');
        }
        return firstValueFrom(
            this.http.get<CategoriesIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<CategoriesShowResponse> {
        return firstValueFrom(this.http.get<CategoriesShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<Category>): Promise<CategoriesCreateResponse> {
        return firstValueFrom(this.http.post<CategoriesCreateResponse>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<Category>): Promise<CategoriesUpdateResponse> {
        return firstValueFrom(this.http.put<CategoriesUpdateResponse>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
