import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { StoresIndexResponse } from '../models/responses/stores/stores-index.response';
import { StoresShowResponse } from '../models/responses/stores/stores-show.response';
import { StoreModel } from '../models/store.model';
import { StoreIndexParams } from '../models/params/store-index.params';

@Injectable({
    providedIn: 'root',
})
export class StoreService {
    private readonly apiUrl: string = `${environment.apiUrl}/stores/`;

    constructor(private http: HttpClient) {}

    async index(params?: StoreIndexParams): Promise<StoresIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<StoresIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<StoresShowResponse> {
        return firstValueFrom(this.http.get<StoresShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<StoreModel>): Promise<StoreModel> {
        return firstValueFrom(this.http.post<StoreModel>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<StoreModel>): Promise<StoreModel> {
        return firstValueFrom(this.http.put<StoreModel>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
