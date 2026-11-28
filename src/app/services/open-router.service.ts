import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { exhaustMap, filter, firstValueFrom, timeout, timer } from 'rxjs';
import type { ProductMetadataJobStatus } from '../models/products/product-metadata-job-status.model';
import type { GeneratedProductMetadata } from '../models/products/generated-product-metadata.model';
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

    async productPhoto(url: string): Promise<Blob> {
        return firstValueFrom(
            this.http.post(`${this.apiUrl}product-metadata/photo`, { url }, { responseType: 'blob' }),
        );
    }

    async productMetadata(title: string, destroyRef: DestroyRef): Promise<GeneratedProductMetadata | null> {
        const endpoint: string = `${this.apiUrl}product-metadata/jobs`;
        const job: { id: string } | null = await firstValueFrom(
            this.http.post<{ id: string }>(endpoint, { title }).pipe(takeUntilDestroyed(destroyRef)),
            { defaultValue: null },
        );
        if (!job || destroyRef.destroyed) return null;

        const result: ProductMetadataJobStatus | null = await firstValueFrom(
            timer(0, 2500).pipe(
                exhaustMap(() => this.http.get<ProductMetadataJobStatus>(`${endpoint}/${job.id}`)),
                filter((status) => status.status !== 'pending'),
                timeout({ first: 180_000, with: () => {
                    throw new Error('Поиск ещё не завершён. Проверьте, запущен ли обработчик очереди.');
                } }),
                takeUntilDestroyed(destroyRef),
            ),
            { defaultValue: null },
        );

        if (!result) return null;
        if (result.status === 'completed') return result.data;
        throw new Error(result.status === 'failed' ? result.message : 'Поиск ещё не завершён.');
    }
}
