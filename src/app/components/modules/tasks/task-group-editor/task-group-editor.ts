import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { TaskGroupService } from '../../../../services/task-group.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskGroupModel } from '../../../../models/task-group.model';

@Component({
    selector: 'app-task-group-editor',
    standalone: true,
    imports: [InputFieldComponent, SkeletonComponent],
    templateUrl: './task-group-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskGroupEditorComponent implements OnInit {
    private readonly taskGroupService = inject(TaskGroupService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);

    title = model<string>('');
    position = model<number>(0);

    ngOnInit(): void {
        const groupId = this.id();

        if (groupId) {
            this.isEditMode.set(true);
            this.loadGroup(groupId);
        }
    }

    private async loadGroup(id: number): Promise<void> {
        this.loading.set(true);

        try {
            const response = await this.taskGroupService.show(id);
            const group = response.data;

            this.title.set(group.title);
            this.position.set(group.position);
        } catch {
            this.notificationService.error('Не удалось загрузить данные колонки');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        const title = this.title().trim();

        if (!title) {
            this.notificationService.error('Название колонки обязательно');

            return;
        }

        this.saving.set(true);

        try {
            const data: Partial<TaskGroupModel> = {
                title,
                position: Number(this.position()) || 0,
            };

            if (this.isEditMode()) {
                await this.taskGroupService.update(this.id()!, data);
            } else {
                await this.taskGroupService.create(data);
            }

            this.notificationService.success('Колонка успешно сохранена');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response?.error?.message ?? 'Ошибка при сохранении колонки',
            );
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }
}
