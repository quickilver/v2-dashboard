import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
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
export class FileManagerFilesComponent implements OnInit {
    private readonly fileManagerService = inject(FileManagerService);

    readonly path = input<string>('');

    readonly directories = signal<FileManagerDirectoryEntry[]>([]);
    readonly files = signal<FileManagerFileEntry[]>([]);
    readonly loading = signal<boolean>(false);

    async ngOnInit(): Promise<void> {
        await this.load();
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
}