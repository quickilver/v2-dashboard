import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FileManagerService } from '../../../services/file-manager.service';
import { NotificationService } from '../../../services/notification.service';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-file-manager-upload',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './file-manager-upload.html',
    styleUrl: './file-manager-upload.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerUploadComponent {
    private readonly fileManagerService = inject(FileManagerService);
    private readonly notificationService = inject(NotificationService);

    readonly path = input<string>('');

    readonly uploadComplete = output<void>();

    readonly uploading = signal<boolean>(false);

    private fileInput?: HTMLInputElement;

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        this.fileInput = input;
        this.uploadFile(input.files[0]);
    }

    private async uploadFile(file: File): Promise<void> {
        this.uploading.set(true);

        try {
            const response = await this.fileManagerService.upload(file, this.path());
            this.notificationService.success(
                'File uploaded',
                `${response.data.name} (${response.data.size} bytes)`,
            );
            this.uploadComplete.emit();
        } catch {
            this.notificationService.error('Upload failed', `Could not upload "${file.name}"`);
        } finally {
            this.uploading.set(false);
            if (this.fileInput) {
                this.fileInput.value = '';
            }
        }
    }
}