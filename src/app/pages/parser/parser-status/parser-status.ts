import {
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
} from '@angular/core';
import { ParserRun } from '../../../models/parsers/parser-run.model';

@Component({
    selector: 'app-parser-status',
    standalone: true,
    templateUrl: './parser-status.html',
    styleUrl: './parser-status.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParserStatusComponent {
    readonly run: InputSignal<ParserRun> = input.required<ParserRun>();
    readonly current: InputSignal<boolean> = input(false);
    readonly controlsDisabled: InputSignal<boolean> = input(false);
    readonly pause: OutputEmitterRef<void> = output<void>();
    readonly resume: OutputEmitterRef<void> = output<void>();

    protected readonly labels: Record<ParserRun['status'], string> = {
        queued: 'В очереди',
        running: 'Выполняется',
        pausing: 'Приостанавливается',
        paused: 'На паузе',
        completed: 'Завершён',
        completed_with_errors: 'Завершён с ошибками',
        failed: 'Прерван',
    };
}
