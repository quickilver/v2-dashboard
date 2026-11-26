import type { FileManagerUploadData } from './file-manager-upload-data.model';

export interface FileManagerUploadResponse {
    message: string;
    data: FileManagerUploadData;
}
