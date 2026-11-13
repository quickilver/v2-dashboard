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

}
