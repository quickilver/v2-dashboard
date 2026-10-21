import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FileManagerService } from '../../../services/file-manager.service';
import { FileManagerDirectoryEntry } from '../../../models/responses/file-manager/file-manager-directory-entry.model';
import { FileManagerFileEntry } from '../../../models/responses/file-manager/file-manager-file-entry.model';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-file-manager-files',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './file-manager-files.html',
    styleUrl: './file-manager-files.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerFilesComponent {
    private readonly fileManagerService = inject(FileManagerService);

    readonly path = input<string>('');
    readonly rootPath = input<string>('');
    readonly navigate = output<string>();

    readonly directories = signal<FileManagerDirectoryEntry[]>([]);
    readonly files = signal<FileManagerFileEntry[]>([]);
    readonly loading = signal<boolean>(false);
    readonly creatingFolder = signal<boolean>(false);
    readonly newFolderName = signal<string>('');

    get parentPath(): string {
        const p = this.path();
        const root = this.rootPath();
        if (!p || p === root) return '';
        const lastSlash = p.lastIndexOf('/');
        return lastSlash > 0 ? p.slice(0, lastSlash) : '';
    }

    get isRoot(): boolean {
        return this.path() === this.rootPath() || !this.path();
    }

    constructor() {
        effect(() => {
            this.path();
            this.load();
        });
    }

    async load(): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.fileManagerService.readDirectory(this.path());
            this.directories.set(response.data.directories);
            this.files.set(response.data.files);
        } finally {
            this.loading.set(false);
        }
    }

    startCreateFolder(): void {
        this.newFolderName.set('');
        this.creatingFolder.set(true);
    }

    cancelCreateFolder(): void {
        this.creatingFolder.set(false);
        this.newFolderName.set('');
    }

    async confirmCreateFolder(): Promise<void> {
        const name = this.newFolderName().trim();
        if (!name) return;

        try {
            await this.fileManagerService.createFolder(name, this.path());
            this.cancelCreateFolder();
            await this.load();
        } catch {
            // error handled by interceptor or notification
        }
    }

    onInputChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.newFolderName.set(target.value);
    }

    onInputKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.confirmCreateFolder();
        } else if (event.key === 'Escape') {
            this.cancelCreateFolder();
        }
    }

    navigateTo(dir: FileManagerDirectoryEntry): void {
        this.navigate.emit(dir.path);
    }

    formatSize(bytes: number): string {
        if (bytes === 0) return '—';
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const value = bytes / Math.pow(1024, i);
        return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
    }

    formatDate(timestamp: number): string {
        return new Date(timestamp * 1000).toLocaleString('ru-RU');
    }
}
