export interface FileManagerUploadData {
    name: string;
    path: string;
    size: number;
    mime_type: string;
}

export interface FileManagerUploadResponse {
    message: string;
    data: FileManagerUploadData;
}