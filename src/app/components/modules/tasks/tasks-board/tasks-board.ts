import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { IconComponent } from '../../../icon/icon';
import { TaskGroupService } from '../../../../services/task-group.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskGroupModel } from '../../../../models/task-group.model';
import { TaskGroupEditorComponent } from '../task-group-editor/task-group-editor';

@Component({
    selector: 'app-tasks-board',
    standalone: true,
    imports: [SkeletonComponent, IconComponent],
    templateUrl: './tasks-board.html',
    styleUrl: './tasks-board.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksBoardComponent implements OnInit {
    private readonly taskGroupService = inject(TaskGroupService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    groups = signal<TaskGroupModel[]>([]);
    loading = signal<boolean>(false);

    ngOnInit(): void {
        this.loadGroups();
    }

    async loadGroups(): Promise<void> {
        this.loading.set(true);

        try {
            const response = await this.taskGroupService.index({
                per_page: 100,
                sort: 'position',
                direction: 'asc',
            });

            this.groups.set(response.data);
        } catch {
            this.notificationService.error('Ошибка при загрузке колонок');
        } finally {
            this.loading.set(false);
        }
    }

    createGroup(): void {
        this.popupService
            .open('Создание колонки', TaskGroupEditorComponent, {
                position: this.nextPosition(),
            })
            .then(() => {
                this.loadGroups();
            });
    }

    editGroup(group: TaskGroupModel): void {
        this.popupService
            .open('Редактирование колонки', TaskGroupEditorComponent, { id: group.id })
            .then(() => {
                this.loadGroups();
            });
    }

    async deleteGroup(group: TaskGroupModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление колонки',
            `Вы уверены, что хотите удалить колонку "${group.title}"? Все задачи в ней будут удалены.`,
            'Удалить',
            'Отмена',
        );

        if (!confirmed) {
            return;
        }

        try {
            await this.taskGroupService.delete(group.id);
            this.notificationService.success('Колонка успешно удалена');
            this.loadGroups();
        } catch {
            this.notificationService.error('Ошибка при удалении колонки');
        }
    }

    private nextPosition(): number {
        const groups = this.groups();

        if (groups.length === 0) {
            return 1;
        }

        return Math.max(...groups.map((group) => group.position)) + 1;
    }
}
