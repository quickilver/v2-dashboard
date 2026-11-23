import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal,
} from '@angular/core';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { TaskGroupService } from '../../../../services/task-group.service';
import { TaskService } from '../../../../services/task.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskGroupModel } from '../../../../models/task-group.model';
import { TaskModel } from '../../../../models/task.model';
import { TasksIndexResponse } from '../../../../models/responses/tasks/tasks-index.response';
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
    dropTarget = signal<{ groupId: number; beforeTaskId: number | null } | null>(null);
    moving = signal<boolean>(false);

    private dragEndedAt = 0;

    ngOnInit(): void {
        this.loadGroups();
    }

    async loadGroups(): Promise<void> {
        this.loading.set(true);

        try {
            const [groupsResponse, tasks] = await Promise.all([
                this.taskGroupService.index({
                    per_page: 100,
                    sort: 'position',
                    direction: 'asc',
                }),
                this.loadTasks(),
            ]);

            this.groups.set(groupsResponse.data);
            this.tasksByGroup.set(this.groupTasksByColumn(tasks));
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
        if (this.moving()) {
            event.preventDefault();
            return;
        }

        this.draggedTask.set(task);

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(task.id));
        }
    }

    onDragEnd(): void {
        this.dragEndedAt = Date.now();
        this.draggedTask.set(null);
        this.dropTarget.set(null);
    }

    onDragOver(group: TaskGroupModel, event: DragEvent): void {
        const task: TaskModel | null = this.draggedTask();
        if (!task) return;

        event.preventDefault();

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }

        const beforeTaskId: number | null = this.findDropAnchor(event, task.id);
        const target = this.dropTarget();
        if (target?.groupId !== group.id || target.beforeTaskId !== beforeTaskId) {
            this.dropTarget.set({ groupId: group.id, beforeTaskId });
        }
    }

    onDragLeave(group: TaskGroupModel, event: DragEvent): void {
        const relatedTarget = event.relatedTarget as Node | null;
        const column = event.currentTarget as HTMLElement;

        if (relatedTarget && column.contains(relatedTarget)) {
            return;
        }

        if (this.dropTarget()?.groupId === group.id) {
            this.dropTarget.set(null);
        }
    }

    async onDrop(group: TaskGroupModel, event: DragEvent): Promise<void> {
        event.preventDefault();

        const task: TaskModel | null = this.draggedTask();
        this.onDragEnd();

        if (!task || this.moving()) return;

        const beforeTaskId: number | null = this.findDropAnchor(event, task.id);
        await this.moveTask(task, group.id, beforeTaskId);
    }

    private findDropAnchor(event: DragEvent, draggedTaskId: number): number | null {
        const column = event.currentTarget as HTMLElement;
        const cards = column.querySelectorAll<HTMLElement>('[data-task-id]');

        for (const card of cards) {
            const taskId: number = Number(card.dataset['taskId']);
            if (taskId === draggedTaskId) continue;

            const bounds: DOMRect = card.getBoundingClientRect();
            if (event.clientY < bounds.top + bounds.height / 2) return taskId;
        }

        return null;
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

    private async moveTask(
        task: TaskModel,
        groupId: number,
        beforeTaskId: number | null,
    ): Promise<void> {
        const previousState: Record<number, TaskModel[]> = this.tasksByGroup();
        const sourceTasks: TaskModel[] = previousState[task.group_id] ?? [];
        const targetTasks: TaskModel[] = (previousState[groupId] ?? []).filter(
            (item) => item.id !== task.id,
        );
        const targetIndex: number =
            beforeTaskId === null
                ? targetTasks.length
                : targetTasks.findIndex((item) => item.id === beforeTaskId);

        if (targetIndex < 0) return;
        if (task.group_id === groupId && sourceTasks[targetIndex]?.id === task.id) return;

        targetTasks.splice(targetIndex, 0, { ...task, group_id: groupId });
        const nextState: Record<number, TaskModel[]> = {
            ...previousState,
            [task.group_id]: sourceTasks.filter((item) => item.id !== task.id),
            [groupId]: targetTasks,
        };

        this.moving.set(true);
        this.tasksByGroup.set(nextState);

        try {
            await this.taskService.move(task.id, groupId, beforeTaskId);
            this.notificationService.success('Порядок задач сохранён');
        } catch {
            if (this.tasksByGroup() === nextState) {
                this.tasksByGroup.set(previousState);
            }
            this.notificationService.error('Не удалось переместить задачу');
        } finally {
            this.moving.set(false);
        }
    }

    private async loadTasks(): Promise<TaskModel[]> {
        const tasks: TaskModel[] = [];
        let page: number = 1;
        let lastPage: number;

        do {
            const response: TasksIndexResponse = await this.taskService.index({
                page,
                per_page: 100,
                sort: 'position',
                direction: 'desc',
            });
            tasks.push(...response.data);
            lastPage = response.meta.last_page;
            page++;
        } while (page <= lastPage);

        return tasks;
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
