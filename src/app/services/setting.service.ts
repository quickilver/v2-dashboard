import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { SettingsIndexResponse } from '../models/responses/settings/settings-index.response';
import { SettingsShowResponse } from '../models/responses/settings/settings-show.response';
import { SettingModel } from '../models/setting.model';
import { SettingIndexParams } from '../models/params/setting-index.params';

@Injectable({
    providedIn: 'root',
})
export class SettingService {
    private readonly apiUrl: string = `${environment.apiUrl}/settings/`;

    constructor(private http: HttpClient) {}

    async index(params?: SettingIndexParams): Promise<SettingsIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
            if (params.group) httpParams = httpParams.set('group', params.group);
        }
        return firstValueFrom(
            this.http.get<SettingsIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<SettingsShowResponse> {
        return firstValueFrom(this.http.get<SettingsShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<SettingModel>): Promise<SettingModel> {
        return firstValueFrom(this.http.post<SettingModel>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<SettingModel>): Promise<SettingModel> {
        return firstValueFrom(this.http.put<SettingModel>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
