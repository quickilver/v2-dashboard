import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaskModel } from '../models/task.model';
import { TaskIndexParams } from '../models/params/task-index.params';
import { TasksIndexResponse } from '../models/responses/tasks/tasks-index.response';
import { TasksShowResponse } from '../models/responses/tasks/tasks-show.response';
import { TasksCreateResponse } from '../models/responses/tasks/tasks-create.response';
import { TasksUpdateResponse } from '../models/responses/tasks/tasks-update.response';

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    private readonly apiUrl: string = `${environment.apiUrl}/tasks/`;

    constructor(private http: HttpClient) {}

    async index(params?: TaskIndexParams): Promise<TasksIndexResponse> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page);
            if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
            if (params.query) httpParams = httpParams.set('query', params.query);
            if (params.sort) httpParams = httpParams.set('sort', params.sort);
            if (params.direction) httpParams = httpParams.set('direction', params.direction);
            if (params.group_id) httpParams = httpParams.set('group_id', params.group_id);
            if (params.assigned_to) httpParams = httpParams.set('assigned_to', params.assigned_to);
            if (params.root_only) httpParams = httpParams.set('root_only', params.root_only);
        }
        return firstValueFrom(this.http.get<TasksIndexResponse>(this.apiUrl, { params: httpParams }));
    }

    async show(id: number): Promise<TasksShowResponse> {
        return firstValueFrom(this.http.get<TasksShowResponse>(`${this.apiUrl}${id}`));
    }

    async create(data: Partial<TaskModel>): Promise<TasksCreateResponse> {
        return firstValueFrom(this.http.post<TasksCreateResponse>(this.apiUrl, data));
    }

    async update(id: number, data: Partial<TaskModel>): Promise<TasksUpdateResponse> {
        return firstValueFrom(this.http.put<TasksUpdateResponse>(`${this.apiUrl}${id}`, data));
    }

    async delete(id: number): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.apiUrl}${id}`));
    }
}
