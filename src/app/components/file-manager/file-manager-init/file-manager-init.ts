import { ChangeDetectionStrategy, Component, effect, input, signal, viewChild } from '@angular/core';
import { FileManagerTreeComponent } from '../file-manager-tree/file-manager-tree';
import { FileManagerUploadComponent } from '../file-manager-upload/file-manager-upload';
import { FileManagerAddressComponent } from '../file-manager-address/file-manager-address';
import { FileManagerFilesComponent } from '../file-manager-files/file-manager-files';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-file-manager-init',
    standalone: true,
    imports: [FileManagerTreeComponent, FileManagerUploadComponent, FileManagerAddressComponent, FileManagerFilesComponent, IconComponent],
    templateUrl: './file-manager-init.html',
    styleUrl: './file-manager-init.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerInitComponent {
    readonly path = input<string>('');

    readonly activePath = signal<string>('');
    readonly expandTreePath = signal<string>('');

    readonly filesComponent = viewChild(FileManagerFilesComponent);
    readonly treeComponent = viewChild(FileManagerTreeComponent);

    constructor() {
        effect(() => {
            this.activePath.set(this.path());
        });
    }

    onNavigate(fullPath: string): void {
        this.activePath.set(fullPath);

        const root = this.path();
        const relative = root
            ? fullPath.startsWith(root + '/')
                ? fullPath.slice(root.length + 1)
                : ''
            : fullPath;
        this.expandTreePath.set(relative);
    }

    createFolder(): void {
        this.filesComponent()?.startCreateFolder();
    }

    onUploadComplete(): void {
        this.filesComponent()?.load();
        this.treeComponent()?.load();
    }
}
