import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ModulesIndexResponse } from '../models/responses/modules/modules-index.response';

@Injectable({
    providedIn: 'root',
})
export class ModulesService {
    private readonly apiUrl: string = `${environment.apiUrl}/modules/`;

    constructor(private http: HttpClient) {}

    async index(): Promise<ModulesIndexResponse> {
        return firstValueFrom(
            this.http.get<ModulesIndexResponse>(this.apiUrl),
        );
    }
}
