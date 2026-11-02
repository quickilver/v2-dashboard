import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    OnInit,
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { StatusService } from '../../../../services/status.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { StatusModel } from '../../../../models/status.model';
import { SkeletonComponent } from '../../../skeleton/skeleton';

@Component({
    selector: 'app-statuses-editor',
    standalone: true,
    imports: [InputFieldComponent, SkeletonComponent],
    templateUrl: './statuses-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusesEditorComponent implements OnInit {
    private readonly statusService = inject(StatusService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);

    title = model<string>('');
    position = model<number>(0);

    ngOnInit(): void {
        const statusId = this.id();
        if (statusId) {
            this.isEditMode.set(true);
            this.loadStatus(statusId);
        }
    }

    private async loadStatus(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.statusService.show(id);
            const status = response.data;
            this.title.set(status.title);
            this.position.set(status.position);
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные статуса');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<StatusModel> = {
                title: this.title().trim(),
                position: Number(this.position()) || 0,
            };

            if (this.isEditMode()) {
                await this.statusService.update(this.id()!, data);
            } else {
                await this.statusService.create(data);
            }

            this.notificationService.success('Статус успешно сохранён');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response.error?.message ?? 'Ошибка при сохранении статуса',
            );
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }
}
