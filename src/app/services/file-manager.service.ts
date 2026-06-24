import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { FileManagerDirectoryResponse } from '../models/responses/file-manager/file-manager-directory-response.model';
import { FileManagerCreateFolderResponse } from '../models/responses/file-manager/file-manager-create-folder-response.model';
import { FileManagerUploadResponse } from '../models/responses/file-manager/file-manager-upload-response.model';

@Injectable({
    providedIn: 'root',
})
export class FileManagerService {
    private readonly apiUrl: string = `${environment.apiUrl}/files`;

    constructor(private http: HttpClient) {}

    async readDirectory(path: string = ''): Promise<FileManagerDirectoryResponse> {
        let httpParams = new HttpParams();
        if (path) {
            httpParams = httpParams.set('path', path);
        }
        return firstValueFrom(
            this.http.get<FileManagerDirectoryResponse>(this.apiUrl, { params: httpParams }),
        );
    }

    async createFolder(name: string, path: string = ''): Promise<FileManagerCreateFolderResponse> {
        return firstValueFrom(
            this.http.post<FileManagerCreateFolderResponse>(`${this.apiUrl}/folder`, { name, path }),
        );
    }

    async upload(file: File, path: string = ''): Promise<FileManagerUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        if (path) {
            formData.append('path', path);
        }
        return firstValueFrom(
            this.http.post<FileManagerUploadResponse>(`${this.apiUrl}/upload`, formData),
        );
    }
}
