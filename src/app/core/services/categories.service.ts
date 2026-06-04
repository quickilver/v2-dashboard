import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({
    providedIn: 'root'
})
export class CategoriesService {
    private readonly apiUrl: string = `${environment.apiUrl}/categories/`;

    constructor(private http: HttpClient) {
    }

    async get(): Promise<Category[]> {
        return firstValueFrom(this.http.get<Category[]>(this.apiUrl));
    }
}
