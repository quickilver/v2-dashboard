import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { TaskService } from '../../../../services/task.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskModel } from '../../../../models/task.model';
import { TaskEditorComponent } from '../task-editor/task-editor';

@Component({
    selector: 'app-task-viewer',
    standalone: true,
    imports: [SkeletonComponent],
    templateUrl: './task-viewer.html',
    styleUrl: './task-viewer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskViewerComponent implements OnInit {
    private readonly taskService = inject(TaskService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input.required<number>();

    task = signal<TaskModel | null>(null);
    loading = signal<boolean>(false);
    tab = signal<string>('info');

    ngOnInit(): void {
        this.loadTask();
    }

    isActiveTab(tab: string): boolean {
        return this.tab() === tab;
    }

    changeTab(tab: string): void {
        this.tab.set(tab);
    }

    async loadTask(): Promise<void> {
        this.loading.set(true);

        try {
            const response = await this.taskService.show(this.id());

            this.task.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить задачу');
        } finally {
            this.loading.set(false);
        }
    }

    edit(): void {
        const task = this.task();

        if (!task) {
            return;
        }

        this.popupService
            .open('Редактирование задачи', TaskEditorComponent, { id: task.id }, 'with-tabs')
            .then(() => {
                this.loadTask();
            });
    }

    close(): void {
        this.popupService.resolve();
    }

    formatDate(value: string | null): string {
        const dateOnly: RegExpExecArray | null = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');

        if (dateOnly) {
            const [, year, month, day] = dateOnly;

            return `${day}.${month}.${year}`;
        }

        const date = this.parseDate(value);

        return date ? date.toLocaleDateString('ru-RU') : '—';
    }

    formatDateTime(value: string | null): string {
        const date = this.parseDate(value);

        if (!date) {
            return '—';
        }

        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    private parseDate(value: string | null): Date | null {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }
}
