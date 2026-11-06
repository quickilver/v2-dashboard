import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    AccountsIndexResponse,
    AccountsShowResponse,
} from '../models/responses/accounts/accounts-index.response';
import { AccountModel } from '../models/account.model';
import { AccountIndexParams } from '../models/params/account-index.params';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    private readonly apiUrl: string = `${environment.apiUrl}/accounts/`;

    constructor(private http: HttpClient) {}

    async index(params?: AccountIndexParams): Promise<AccountsIndexResponse> {
        let httpParams = new HttpParams();

        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
            if (params.is_blocked !== undefined && params.is_blocked !== null) {
                httpParams = httpParams.set('is_blocked', params.is_blocked ? 1 : 0);
            }
        }

        return firstValueFrom(
            this.http.get<AccountsIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<AccountsShowResponse> {
        return firstValueFrom(this.http.get<AccountsShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<AccountModel> & { password: string }): Promise<AccountModel> {
        return firstValueFrom(this.http.post<AccountModel>(this.apiUrl, data));
    }

    async update(
        id: number,
        data: Partial<AccountModel> & { password?: string },
    ): Promise<AccountModel> {
        return firstValueFrom(this.http.put<AccountModel>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
