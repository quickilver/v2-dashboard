import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { LogsIndexResponse } from '../models/responses/logs/logs-index.response';
import { LogsShowResponse } from '../models/responses/logs/logs-show.response';
import { LogIndexParams } from '../models/params/log-index.params';

@Injectable({
    providedIn: 'root',
})
export class LogService {
    private readonly apiUrl: string = `${environment.apiUrl}/logs/`;

    constructor(private http: HttpClient) {}

    async index(params?: LogIndexParams): Promise<LogsIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.event) httpParams = httpParams.set('event', params.event);
            if (params.model_type) httpParams = httpParams.set('model_type', params.model_type);
            if (params.user_id !== undefined)
                httpParams = httpParams.set('user_id', params.user_id);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<LogsIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<LogsShowResponse> {
        return firstValueFrom(this.http.get<LogsShowResponse>(`${this.apiUrl}${id}`));
    }
}