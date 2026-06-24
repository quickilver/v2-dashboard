import { FileManagerDirectoryEntry } from './file-manager-directory-entry.model';
import { FileManagerFileEntry } from './file-manager-file-entry.model';

export interface FileManagerDirectoryData {
    path: string;
    directories: FileManagerDirectoryEntry[];
    files: FileManagerFileEntry[];
}
