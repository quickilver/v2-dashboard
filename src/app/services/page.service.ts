import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagesIndexResponse } from '../models/responses/pages/pages-index.response';
import { PagesShowResponse } from '../models/responses/pages/pages-show.response';
import { PageModel } from '../models/page.model';
import { PageIndexParams } from '../models/params/page-index.params';

@Injectable({
    providedIn: 'root',
})
export class PageService {
    private readonly apiUrl: string = `${environment.apiUrl}/pages/`;

    constructor(private http: HttpClient) {}

    async index(params?: PageIndexParams): Promise<PagesIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<PagesIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<PagesShowResponse> {
        return firstValueFrom(this.http.get<PagesShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<PageModel>): Promise<PageModel> {
        return firstValueFrom(this.http.post<PageModel>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<PageModel>): Promise<PageModel> {
        return firstValueFrom(this.http.put<PageModel>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}