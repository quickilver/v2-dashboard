import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { StatusModel } from '../models/status.model';
import { StatusIndexParams } from '../models/params/status-index.params';
import { StatusesIndexResponse } from '../models/responses/statuses/statuses-index.response';
import { StatusesShowResponse } from '../models/responses/statuses/statuses-show.response';
import { StatusesCreateResponse } from '../models/responses/statuses/statuses-create.response';
import { StatusesUpdateResponse } from '../models/responses/statuses/statuses-update.response';

@Injectable({
    providedIn: 'root',
})
export class StatusService {
    private readonly apiUrl: string = `${environment.apiUrl}/statuses/`;

    constructor(private http: HttpClient) {}

    async index(params?: StatusIndexParams): Promise<StatusesIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<StatusesIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<StatusesShowResponse> {
        return firstValueFrom(this.http.get<StatusesShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<StatusModel>): Promise<StatusesCreateResponse> {
        return firstValueFrom(this.http.post<StatusesCreateResponse>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<StatusModel>): Promise<StatusesUpdateResponse> {
        return firstValueFrom(this.http.put<StatusesUpdateResponse>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
