export interface FileManagerUploadData {
    name: string;
    path: string;
    url: string;
    size: number;
    mime_type: string;
}

export interface FileManagerUploadResponse {
    message: string;
    data: FileManagerUploadData;
}
