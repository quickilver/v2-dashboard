import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class OpenRouterService {
    private readonly apiUrl = `${environment.apiUrl}/open-router/`;

    constructor(private readonly http: HttpClient) {}

    async formatting(text: string): Promise<string> {
        const response = await firstValueFrom(
            this.http.post<{ data: string }>(`${this.apiUrl}formatting`, { text }),
        );
        return response.data;
    }

    async refactoring(text: string): Promise<string> {
        const response = await firstValueFrom(
            this.http.post<{ data: string }>(`${this.apiUrl}refactoring`, { text }),
        );
        return response.data;
    }
}
