import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { SettingGroupsIndexResponse } from '../models/responses/settings/setting-groups-index.response';

@Injectable({
    providedIn: 'root',
})
export class SettingGroupService {
    private readonly apiUrl: string = `${environment.apiUrl}/settings/groups`;

    constructor(private http: HttpClient) {}

    async index(): Promise<SettingGroupsIndexResponse> {
        return firstValueFrom(this.http.get<SettingGroupsIndexResponse>(this.apiUrl));
    }
}
