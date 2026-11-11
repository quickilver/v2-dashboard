import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaskGroupModel } from '../models/task-group.model';
import { TaskGroupIndexParams } from '../models/params/task-group-index.params';
import { TaskGroupsIndexResponse } from '../models/responses/task-groups/task-groups-index.response';
import { TaskGroupsShowResponse } from '../models/responses/task-groups/task-groups-show.response';
import { TaskGroupsCreateResponse } from '../models/responses/task-groups/task-groups-create.response';
import { TaskGroupsUpdateResponse } from '../models/responses/task-groups/task-groups-update.response';

@Injectable({
    providedIn: 'root',
})
export class TaskGroupService {
    private readonly apiUrl: string = `${environment.apiUrl}/task-groups/`;

    constructor(private http: HttpClient) {}

    async index(params?: TaskGroupIndexParams): Promise<TaskGroupsIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
        }
        return firstValueFrom(
            this.http.get<TaskGroupsIndexResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async show(id: number): Promise<TaskGroupsShowResponse> {
        return firstValueFrom(this.http.get<TaskGroupsShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<TaskGroupModel>): Promise<TaskGroupsCreateResponse> {
        return firstValueFrom(this.http.post<TaskGroupsCreateResponse>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<TaskGroupModel>): Promise<TaskGroupsUpdateResponse> {
        return firstValueFrom(this.http.put<TaskGroupsUpdateResponse>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
