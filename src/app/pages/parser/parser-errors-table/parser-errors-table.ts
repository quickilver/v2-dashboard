import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
} from '@angular/core';
import { ParserRun } from '../../../models/parsers/parser-run.model';
import { ParserRunErrorsPage } from '../../../models/parsers/parser-run-errors-page.model';

@Component({
    selector: 'app-parser-errors-table',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './parser-errors-table.html',
    styleUrl: './parser-errors-table.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParserErrorsTableComponent {
    readonly run: InputSignal<ParserRun> = input.required<ParserRun>();
    readonly errorsPage: InputSignal<ParserRunErrorsPage | null> =
        input.required<ParserRunErrorsPage | null>();
    readonly errorsLoadFailed: InputSignal<boolean> = input.required<boolean>();
    readonly retryDisabled: InputSignal<boolean> = input.required<boolean>();

    readonly retry: OutputEmitterRef<void> = output<void>();
    readonly pageChange: OutputEmitterRef<number> = output<number>();
}
