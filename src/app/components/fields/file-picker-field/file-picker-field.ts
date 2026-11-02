import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { FileManagerPopupComponent } from '../../file-manager/file-manager-popup/file-manager-popup';
import { FileManagerFileEntry } from '../../../models/responses/file-manager/file-manager-file-entry.model';
import { PopupService } from '../../../services/popup.service';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-file-picker-field',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './file-picker-field.html',
    styleUrl: './file-picker-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePickerFieldComponent {
    private readonly popupService = inject(PopupService);

    label = input<string>('');
    placeholder = input<string>('Файл не выбран');
    buttonLabel = input<string>('Выбрать файл');

    value = model<FileManagerFileEntry | null>(null);

    async openFileManager(): Promise<void> {
        const file = await this.popupService.open<FileManagerFileEntry>(
            'Файловый менеджер',
            FileManagerPopupComponent,
        );

        if (file) {
            this.value.set(file);
        }
    }

    clear(): void {
        this.value.set(null);
    }
}
