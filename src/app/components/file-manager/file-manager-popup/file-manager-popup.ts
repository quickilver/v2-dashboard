import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FileManagerInitComponent } from '../file-manager-init/file-manager-init';
import { FileManagerFileEntry } from '../../../models/responses/file-manager/file-manager-file-entry.model';
import { PopupService } from '../../../services/popup.service';

@Component({
    selector: 'app-file-manager-popup',
    standalone: true,
    imports: [FileManagerInitComponent],
    template: `
        <app-file-manager-init
            [path]="path()"
            [selectable]="true"
            (fileSelected)="onFileSelected($event)"
        />
    `,
    styles: `
        :host {
            display: block;
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerPopupComponent {
    readonly path = input<string>('');

    private readonly popupService = inject(PopupService);

    onFileSelected(file: FileManagerFileEntry): void {
        this.popupService.resolve(file);
    }
}
