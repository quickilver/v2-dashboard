import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FileManagerService } from '../../../services/file-manager.service';
import { FileManagerDirectoryEntry } from '../../../models/responses/file-manager/file-manager-directory-entry.model';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-file-manager-tree',
    templateUrl: './file-manager-tree.html',
    styleUrl: './file-manager-tree.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IconComponent
    ],
    standalone: true
})
export class FileManagerTreeComponent implements OnInit {
    private readonly fileManagerService = inject(FileManagerService);

    readonly path = input<string>('');

    readonly directories = signal<FileManagerDirectoryEntry[]>([]);
    readonly loading = signal<boolean>(false);

    async ngOnInit(): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.fileManagerService.readDirectory(this.path());
            this.directories.set(response.data.directories);
        } finally {
            this.loading.set(false);
        }
    }
}
