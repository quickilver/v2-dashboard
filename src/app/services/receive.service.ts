import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReceiveIndexParams } from '../models/params/receive-index.params';
import { ReceiveCreateRequest } from '../models/receives/receive-create-request.model';
import { ReceivesIndexResponse } from '../models/responses/receives/receives-index.response';
import { ReceivesShowResponse } from '../models/responses/receives/receives-show.response';
import { ReceivesCreateResponse } from '../models/responses/receives/receives-create.response';
import { ReceivesUpdateResponse } from '../models/responses/receives/receives-update.response';

@Injectable({
    providedIn: 'root',
})
export class ReceiveService {
    private readonly apiUrl: string = `${environment.apiUrl}/receives/`;

    constructor(private http: HttpClient) {}

    async index(params?: ReceiveIndexParams): Promise<ReceivesIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
            if (params.store_id) httpParams = httpParams.set('store_id', params.store_id);
            if (params.supplier_id) httpParams = httpParams.set('supplier_id', params.supplier_id);
            if (params.user_id) httpParams = httpParams.set('user_id', params.user_id);
            if (params.date_from) httpParams = httpParams.set('date_from', params.date_from);
            if (params.date_to) httpParams = httpParams.set('date_to', params.date_to);
        }
        return firstValueFrom(
            this.http.get<ReceivesIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<ReceivesShowResponse> {
        return firstValueFrom(this.http.get<ReceivesShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: ReceiveCreateRequest): Promise<ReceivesCreateResponse> {
        return firstValueFrom(this.http.post<ReceivesCreateResponse>(this.apiUrl, data));
    }

    async update(id: number, data: ReceiveCreateRequest): Promise<ReceivesUpdateResponse> {
        return firstValueFrom(this.http.put<ReceivesUpdateResponse>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
