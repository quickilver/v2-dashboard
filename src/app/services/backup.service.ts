import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { BackupsIndexResponse } from '../models/responses/backups/backups-index.response';
import { BackupModel } from '../models/backup.model';

@Injectable({
    providedIn: 'root',
})
export class BackupService {
    private readonly apiUrl: string = `${environment.apiUrl}/backups/`;

    constructor(private http: HttpClient) {}

    async index(): Promise<BackupsIndexResponse> {
        return firstValueFrom(this.http.get<BackupsIndexResponse>(this.apiUrl));
    }

    async create(compress: boolean = false, noSsl: boolean = false): Promise<BackupModel> {
        return firstValueFrom(
            this.http.post<BackupModel>(this.apiUrl, { compress, no_ssl: noSsl }),
        );
    }

    async restore(
        file: string,
        createDatabase: boolean = false,
        noSsl: boolean = false,
    ): Promise<void> {
        return firstValueFrom(
            this.http.post<void>(`${this.apiUrl}restore`, {
                file,
                create_database: createDatabase,
                no_ssl: noSsl,
            }),
        );
    }

    async download(file: string): Promise<Blob> {
        return firstValueFrom(
            this.http.get(`${this.apiUrl}${encodeURIComponent(file)}/download`, {
                responseType: 'blob',
            }),
        );
    }
}
