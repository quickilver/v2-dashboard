import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal,
} from '@angular/core';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { IconComponent } from '../../../icon/icon';
import { TaskGroupService } from '../../../../services/task-group.service';
import { TaskService } from '../../../../services/task.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskGroupModel } from '../../../../models/task-group.model';
import { TaskModel } from '../../../../models/task.model';
import { TaskGroupEditorComponent } from '../task-group-editor/task-group-editor';
import { TaskEditorComponent } from '../task-editor/task-editor';
import { TaskViewerComponent } from '../task-viewer/task-viewer';
import { TaskCardComponent } from '../task-card/task-card';

@Component({
    selector: 'app-tasks-board',
    standalone: true,
    imports: [SkeletonComponent, TaskCardComponent],
    templateUrl: './tasks-board.html',
    styleUrl: './tasks-board.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksBoardComponent implements OnInit {
    private readonly taskGroupService = inject(TaskGroupService);
    private readonly taskService = inject(TaskService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    groups = signal<TaskGroupModel[]>([]);
    tasksByGroup = signal<Record<number, TaskModel[]>>({});
    loading = signal<boolean>(false);
    draggedTask = signal<TaskModel | null>(null);
    dragOverGroupId = signal<number | null>(null);
    moving = signal<boolean>(false);

    private dragEndedAt = 0;

    ngOnInit(): void {
        this.loadGroups();
    }

    async loadGroups(): Promise<void> {
        this.loading.set(true);

        try {
            const [groupsResponse, tasksResponse] = await Promise.all([
                this.taskGroupService.index({
                    per_page: 100,
                    sort: 'position',
                    direction: 'asc',
                }),
                this.taskService.index({ per_page: 100, sort: 'id', direction: 'asc' }),
            ]);

            this.groups.set(groupsResponse.data);
            this.tasksByGroup.set(this.groupTasksByColumn(tasksResponse.data));
        } catch {
            this.notificationService.error('Ошибка при загрузке доски задач');
        } finally {
            this.loading.set(false);
        }
    }

    tasksOf(group: TaskGroupModel): TaskModel[] {
        return this.tasksByGroup()[group.id] ?? [];
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

    createTask(group: TaskGroupModel): void {
        this.popupService
            .open('Создание задачи', TaskEditorComponent, { groupId: group.id }, 'with-tabs')
            .then(() => {
                this.loadGroups();
            });
    }

    openTask(task: TaskModel): void {
        if (Date.now() - this.dragEndedAt < 150) {
            return;
        }

        this.popupService
            .open(task.title, TaskViewerComponent, { id: task.id }, 'with-tabs')
            .then(() => {
                this.loadGroups();
            });
    }

    onDragStart(task: TaskModel, event: DragEvent): void {
        this.draggedTask.set(task);

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(task.id));
        }
    }

    onDragEnd(): void {
        this.dragEndedAt = Date.now();
        this.draggedTask.set(null);
        this.dragOverGroupId.set(null);
    }

    onDragOver(group: TaskGroupModel, event: DragEvent): void {
        if (!this.draggedTask()) {
            return;
        }

        event.preventDefault();

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }

        this.dragOverGroupId.set(group.id);
    }

    onDragLeave(group: TaskGroupModel, event: DragEvent): void {
        const relatedTarget = event.relatedTarget as Node | null;
        const column = event.currentTarget as HTMLElement;

        if (relatedTarget && column.contains(relatedTarget)) {
            return;
        }

        if (this.dragOverGroupId() === group.id) {
            this.dragOverGroupId.set(null);
        }
    }

    async onDrop(group: TaskGroupModel, event: DragEvent): Promise<void> {
        event.preventDefault();

        const task = this.draggedTask();

        this.dragEndedAt = Date.now();
        this.draggedTask.set(null);
        this.dragOverGroupId.set(null);

        if (!task || task.group_id === group.id || this.moving()) {
            return;
        }

        await this.moveTask(task, group.id);
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

    private async moveTask(task: TaskModel, groupId: number): Promise<void> {
        const previousState = this.tasksByGroup();

        this.moving.set(true);
        this.tasksByGroup.set(this.moveTaskInState(previousState, task, groupId));

        try {
            await this.taskService.update(task.id, {
                group_id: groupId,
                title: task.title,
                description: task.description,
                assigned_to: task.assigned_to,
                start_at: task.start_at,
                finish_at: task.finish_at,
            });
            this.notificationService.success('Задача перемещена');
        } catch {
            this.tasksByGroup.set(previousState);
            this.notificationService.error('Не удалось переместить задачу');
        } finally {
            this.moving.set(false);
        }
    }

    private moveTaskInState(
        state: Record<number, TaskModel[]>,
        task: TaskModel,
        groupId: number,
    ): Record<number, TaskModel[]> {
        const result: Record<number, TaskModel[]> = {};

        for (const [key, tasks] of Object.entries(state)) {
            result[Number(key)] = tasks.filter((item) => item.id !== task.id);
        }

        const movedTask: TaskModel = { ...task, group_id: groupId };

        result[groupId] = [...(result[groupId] ?? []), movedTask];

        return result;
    }

    private groupTasksByColumn(tasks: TaskModel[]): Record<number, TaskModel[]> {
        const result: Record<number, TaskModel[]> = {};

        for (const task of tasks) {
            const columnTasks = result[task.group_id] ?? [];

            columnTasks.push(task);
            result[task.group_id] = columnTasks;
        }

        return result;
    }

    private nextPosition(): number {
        const groups = this.groups();

        if (groups.length === 0) {
            return 1;
        }

        return Math.max(...groups.map((group) => group.position)) + 1;
    }
}
