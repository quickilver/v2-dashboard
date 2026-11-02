import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FileManagerInitComponent } from '../../components/file-manager/file-manager-init/file-manager-init';
import { FilePickerFieldComponent } from '../../components/fields/file-picker-field/file-picker-field';
import { FileManagerFileEntry } from '../../models/responses/file-manager/file-manager-file-entry.model';

@Component({
    selector: 'app-homepage',
    standalone: true,
    imports: [FileManagerInitComponent, FilePickerFieldComponent],
    templateUrl: './homepage.html',
    styleUrl: './homepage.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomepageComponent {
    readonly selectedFile = signal<FileManagerFileEntry | null>(null);
}
