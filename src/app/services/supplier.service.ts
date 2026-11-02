import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupplierModel } from '../models/supplier.model';
import { SupplierIndexParams } from '../models/params/supplier-index.params';
import { SuppliersIndexResponse } from '../models/responses/suppliers/suppliers-index.response';
import { SuppliersShowResponse } from '../models/responses/suppliers/suppliers-show.response';
import { SuppliersCreateResponse } from '../models/responses/suppliers/suppliers-create.response';
import { SuppliersUpdateResponse } from '../models/responses/suppliers/suppliers-update.response';

@Injectable({
    providedIn: 'root',
})
export class SupplierService {
    private readonly apiUrl: string = `${environment.apiUrl}/suppliers/`;

    constructor(private http: HttpClient) {}

    async index(params?: SupplierIndexParams): Promise<SuppliersIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<SuppliersIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<SuppliersShowResponse> {
        return firstValueFrom(this.http.get<SuppliersShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<SupplierModel>): Promise<SuppliersCreateResponse> {
        return firstValueFrom(this.http.post<SuppliersCreateResponse>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<SupplierModel>): Promise<SuppliersUpdateResponse> {
        return firstValueFrom(this.http.put<SuppliersUpdateResponse>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
