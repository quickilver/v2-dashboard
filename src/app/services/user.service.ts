import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsersIndexResponse } from '../models/responses/users/users-index.response';
import { UsersShowResponse } from '../models/responses/users/users-show.response';
import { UserIndexParams } from '../models/params/user-index.params';
import { UserModel } from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly apiUrl: string = `${environment.apiUrl}/users/`;

    constructor(private http: HttpClient) {}

    async index(params?: UserIndexParams): Promise<UsersIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<UsersIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<UsersShowResponse> {
        return firstValueFrom(this.http.get<UsersShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<UserModel>): Promise<UserModel> {
        return firstValueFrom(this.http.post<UserModel>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<UserModel>): Promise<UserModel> {
        return firstValueFrom(this.http.put<UserModel>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
