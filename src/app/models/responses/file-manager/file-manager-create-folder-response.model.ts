import { FileManagerDirectoryEntry } from './file-manager-directory-entry.model';

export interface FileManagerCreateFolderResponse {
    message: string;
    data: FileManagerDirectoryEntry;
}
