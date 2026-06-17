import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AttributesIndexResponse } from '../models/responses/attributes/attributes-index.response';
import { AttributesShowResponse } from '../models/responses/attributes/attributes-show.response';
import { AttributeShortModel } from '../models/attributes/attribute-short.model';
import { AttributeStoreModel } from '../models/attributes/attribute-store.model';
import { AttributeIndexParams } from '../models/params/attribute-index.params';

@Injectable({
    providedIn: 'root',
})
export class AttributeService {
    private readonly apiUrl: string = `${environment.apiUrl}/attributes/`;

    constructor(private http: HttpClient) {}

    async index(params?: AttributeIndexParams): Promise<AttributesIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<AttributesIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<AttributesShowResponse> {
        return firstValueFrom(this.http.get<AttributesShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<AttributeStoreModel>): Promise<AttributeShortModel> {
        return firstValueFrom(this.http.post<AttributeShortModel>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<AttributeStoreModel>): Promise<AttributeShortModel> {
        return firstValueFrom(this.http.put<AttributeShortModel>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
