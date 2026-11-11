import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../../../icon/icon';
import { TaskModel } from '../../../../models/task.model';

@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
    task = input.required<TaskModel>();

    opened = output<TaskModel>();

    onOpen(): void {
        this.opened.emit(this.task());
    }

    formatDate(value: string | null): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString('ru-RU');
    }

    isFuture(value: string | null): boolean {
        if (!value) {
            return false;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return false;
        }

        return date.getTime() > Date.now();
    }

    isToday(value: string | null): boolean {
        if (!value) {
            return false;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return false;
        }

        const today = new Date();

        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    }
}
