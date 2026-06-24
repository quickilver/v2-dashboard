import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { FileManagerTreeComponent } from '../file-manager-tree/file-manager-tree';
import { FileManagerUploadComponent } from '../file-manager-upload/file-manager-upload';
import { FileManagerFilesComponent } from '../file-manager-files/file-manager-files';

@Component({
    selector: 'app-file-manager-init',
    standalone: true,
    imports: [FileManagerTreeComponent, FileManagerUploadComponent, FileManagerFilesComponent],
    templateUrl: './file-manager-init.html',
    styleUrl: './file-manager-init.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerInitComponent {
    readonly path = input<string>('');

    readonly filesComponent = viewChild(FileManagerFilesComponent);

    onUploadComplete(): void {
        this.filesComponent()?.load();
    }
}