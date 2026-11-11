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
import { TextareaFieldComponent } from '../../../fields/textarea-field/textarea-field';
import { SelectFieldComponent, SelectOption } from '../../../fields/select-field/select-field';
import { CalendarFieldComponent } from '../../../fields/calendar-field/calendar-field';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { TaskService } from '../../../../services/task.service';
import { TaskGroupService } from '../../../../services/task-group.service';
import { UserService } from '../../../../services/user.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskModel } from '../../../../models/task.model';

@Component({
    selector: 'app-task-editor',
    standalone: true,
    imports: [
        InputFieldComponent,
        TextareaFieldComponent,
        SelectFieldComponent,
        CalendarFieldComponent,
        SkeletonComponent,
    ],
    templateUrl: './task-editor.html',
    styleUrl: './task-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskEditorComponent implements OnInit {
    private readonly taskService = inject(TaskService);
    private readonly taskGroupService = inject(TaskGroupService);
    private readonly userService = inject(UserService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);
    groupId = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    taskGroupId = model<number | null>(null);
    title = model<string>('');
    description = model<string>('');
    assignedTo = model<number | null>(null);
    startAt = model<string>('');
    finishAt = model<string>('');

    groupOptions = signal<SelectOption[]>([]);
    assigneeOptions = signal<SelectOption[]>([]);

    ngOnInit(): void {
        const taskId = this.id();

        if (taskId) {
            this.isEditMode.set(true);
            this.loading.set(true);
        } else {
            this.taskGroupId.set(this.groupId());
            this.startAt.set(this.today());
        }

        this.loadDictionaries(taskId ?? null);
    }

    private async loadDictionaries(taskId: number | null): Promise<void> {
        try {
            const [groupsResponse, usersResponse] = await Promise.all([
                this.taskGroupService.index({ per_page: 100, sort: 'position', direction: 'asc' }),
                this.userService.index({ per_page: 100 }),
            ]);

            this.groupOptions.set(
                groupsResponse.data.map((group) => ({ label: group.title, value: group.id })),
            );
            this.assigneeOptions.set(
                usersResponse.data.map((user) => ({ label: user.name, value: user.id })),
            );

            if (taskId) {
                await this.loadTask(taskId);
            }
        } catch {
            this.notificationService.error('Не удалось загрузить данные для формы задачи');
        } finally {
            this.loading.set(false);
        }
    }

    private async loadTask(id: number): Promise<void> {
        const response = await this.taskService.show(id);
        const task = response.data;

        this.taskGroupId.set(task.group_id);
        this.title.set(task.title);
        this.description.set(task.description ?? '');
        this.assignedTo.set(task.assigned_to);
        this.startAt.set(this.toDisplayDate(task.start_at));
        this.finishAt.set(this.toDisplayDate(task.finish_at));
    }

    isActiveTab(tab: string): boolean {
        return this.tab() === tab;
    }

    changeTab(tab: string): void {
        this.tab.set(tab);
    }

    async onSave(): Promise<void> {
        const title = this.title().trim();

        if (!title) {
            this.notificationService.error('Название задачи обязательно');

            return;
        }

        const taskGroupId = this.taskGroupId();
        if (!taskGroupId) {
            this.notificationService.error('Выберите колонку');

            return;
        }

        const startAt = this.toApiDate(this.startAt());
        if (!startAt) {
            this.notificationService.error('Укажите дату начала');

            return;
        }

        this.saving.set(true);

        try {
            const data: Partial<TaskModel> = {
                group_id: Number(taskGroupId),
                title,
                description: this.description().trim() || null,
                assigned_to: this.assignedTo(),
                start_at: startAt,
                finish_at: this.toApiDate(this.finishAt()),
            };

            if (this.isEditMode()) {
                await this.taskService.update(this.id()!, data);
            } else {
                await this.taskService.create(data);
            }

            this.notificationService.success('Задача успешно сохранена');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response?.error?.message ?? 'Ошибка при сохранении задачи',
            );
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }

    private today(): string {
        return this.toDisplayDate(new Date().toISOString()) ?? '';
    }

    /**
     * Преобразует ISO-дату в формат поля календаря (DD.MM.YYYY).
     */
    private toDisplayDate(value: string | null): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        return `${day}.${month}.${date.getFullYear()}`;
    }

    /**
     * Преобразует DD.MM.YYYY в YYYY-MM-DD для API.
     */
    private toApiDate(value: string): string | null {
        if (!value) {
            return null;
        }

        const parts = value.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [day, month, year] = parts;

        return `${year}-${month}-${day}`;
    }
}
