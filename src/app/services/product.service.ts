import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductsIndexResponse } from '../models/responses/products/products-index.response';
import { ProductsShowResponse } from '../models/responses/products/products-show.response';
import { ProductsStoreResponse } from '../models/responses/products/products-store.response';
import { ProductCreateRequest } from '../models/products/product-create-request.model';
import { ProductPictureItem } from '../models/products/product-picture-item.model';
import {
    ProductAttributeFilter,
    ProductPriceFilter,
} from '../models/products/product-filters.model';

export interface ProductIndexParams {
    page?: number;
    per_page?: number;
    query?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    categories?: number[];
    stores?: number[];
    prices?: ProductPriceFilter[];
    attributes?: ProductAttributeFilter[];
}

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private readonly apiUrl: string = `${environment.apiUrl}/products/`;

    constructor(private http: HttpClient) {}

    async index(params?: ProductIndexParams): Promise<ProductsIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
            if (params.categories?.length)
                httpParams = httpParams.set('categories', params.categories.join(','));
            if (params.stores?.length)
                httpParams = httpParams.set('stores', params.stores.join(','));
            params.attributes?.forEach((attribute, index) => {
                httpParams = httpParams.set(`attributes[${index}][id]`, attribute.id);
                attribute.values.forEach((valueId, valueIndex) => {
                    httpParams = httpParams.set(
                        `attributes[${index}][values][${valueIndex}]`,
                        valueId,
                    );
                });
            });
            params.prices?.forEach((price, index) => {
                httpParams = httpParams.set(`prices[${index}][id]`, price.id);
                if (price.min !== null)
                    httpParams = httpParams.set(`prices[${index}][min]`, price.min);
                if (price.max !== null)
                    httpParams = httpParams.set(`prices[${index}][max]`, price.max);
            });
        }
        return firstValueFrom(
            this.http.get<ProductsIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<ProductsShowResponse> {
        return firstValueFrom(this.http.get<ProductsShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(
        data: ProductCreateRequest,
        pictures: ProductPictureItem[] = [],
    ): Promise<ProductsStoreResponse> {
        return firstValueFrom(
            this.http.post<ProductsStoreResponse>(this.apiUrl, this.buildPayload(data, pictures)),
        );
    }

    async update(
        id: number,
        data: Partial<ProductCreateRequest>,
        pictures: ProductPictureItem[] = [],
    ): Promise<ProductsStoreResponse> {
        const payload = this.buildPayload(data, pictures);

        // Laravel не парсит multipart для PUT — используем POST с _method.
        if (payload instanceof FormData) {
            payload.append('_method', 'PUT');

            return firstValueFrom(
                this.http.post<ProductsStoreResponse>(`${this.apiUrl}${id}`, payload),
            );
        }

        return firstValueFrom(
            this.http.put<ProductsStoreResponse>(`${this.apiUrl}${id}`, payload),
        );
    }

    /**
     * Собирает тело запроса: JSON, если файлов нет, иначе multipart/form-data.
     */
    private buildPayload(
        data: Partial<ProductCreateRequest>,
        pictures: ProductPictureItem[],
    ): Record<string, unknown> | FormData {
        const hasFiles = pictures.some((picture) => picture.file !== null);

        if (!hasFiles) {
            return {
                ...data,
                pictures: pictures.map((picture, index) => ({
                    id: picture.id,
                    position: index + 1,
                    is_main: picture.is_main,
                })),
            };
        }

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === null || value === undefined) return;

            if (Array.isArray(value) || typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        });

        pictures.forEach((picture, index) => {
            if (picture.id !== null) {
                formData.append(`pictures[${index}][id]`, String(picture.id));
            }

            if (picture.file !== null) {
                formData.append(`pictures[${index}][file]`, picture.file);
            }

            formData.append(`pictures[${index}][position]`, String(index + 1));
            formData.append(`pictures[${index}][is_main]`, picture.is_main ? '1' : '0');
        });

        return formData;
    }
}
