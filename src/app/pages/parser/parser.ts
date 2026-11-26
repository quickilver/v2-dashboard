import { DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    PLATFORM_ID,
    signal,
    Signal,
    WritableSignal,
} from '@angular/core';
import { IconComponent } from '../../components/icon/icon';
import { ParserRun } from '../../models/parsers/parser-run.model';
import { ParserRunErrorsPage } from '../../models/parsers/parser-run-errors-page.model';
import { ParserRunsPage } from '../../models/parsers/parser-runs-page.model';
import { ParserService } from '../../services/parser.service';
import { ParserErrorsTableComponent } from './parser-errors-table/parser-errors-table';
import { ParserStatusComponent } from './parser-status/parser-status';

@Component({
    selector: 'app-parser',
    standalone: true,
    imports: [DatePipe, IconComponent, ParserErrorsTableComponent, ParserStatusComponent],
    templateUrl: './parser.html',
    styleUrl: './parser.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParserPageComponent {
    private readonly service: ParserService = inject(ParserService);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly latest: WritableSignal<ParserRunsPage | null> = signal(null);
    private readonly historical: WritableSignal<ParserRunsPage | null> = signal(null);
    private refreshing: boolean = false;
    private pageRequest: number = 0;
    private errorsRequest: number = 0;
    private statusRequest: number = 0;

    protected readonly page: WritableSignal<number> = signal(1);
    protected readonly loading: WritableSignal<boolean> = signal(true);
    protected readonly starting: WritableSignal<boolean> = signal(false);
    protected readonly changingStatus: WritableSignal<boolean> = signal(false);
    protected readonly loadError: WritableSignal<string> = signal('');
    protected readonly startError: WritableSignal<string> = signal('');
    protected readonly expandedRun: WritableSignal<number | null> = signal(null);
    protected readonly errorsPage: WritableSignal<ParserRunErrorsPage | null> = signal(null);
    protected readonly errorsLoadFailed: WritableSignal<boolean> = signal(false);
    protected readonly active: Signal<ParserRun | undefined> = computed(() =>
        this.latest()?.data.find((run: ParserRun) =>
            ['queued', 'running', 'pausing', 'paused'].includes(run.status),
        ),
    );
    protected readonly history: Signal<ParserRunsPage | null> = computed(() =>
        this.page() === 1 ? this.latest() : this.historical(),
    );
    constructor() {
        if (isPlatformBrowser(inject(PLATFORM_ID))) {
            void this.refresh();
            const timer: ReturnType<typeof setInterval> = setInterval(
                () => void this.refresh(),
                5000,
            );
            this.destroyRef.onDestroy(() => clearInterval(timer));
        }
    }

    protected async selectPage(page: number): Promise<void> {
        const request: number = ++this.pageRequest;
        if (page === 1) {
            this.page.set(1);
            return;
        }
        try {
            const response: ParserRunsPage = await this.service.index(page);
            if (request === this.pageRequest) {
                this.historical.set(response);
                this.page.set(page);
                this.loadError.set('');
            }
        } catch {
            this.loadError.set('Не удалось загрузить страницу истории.');
        }
    }

    protected start(mode: ParserRun['mode']): Promise<void> {
        return this.startRun(() => this.service.create(mode));
    }

    protected retryErrors(runId: number): Promise<void> {
        return this.startRun(() => this.service.retryErrors(runId));
    }

    protected async changeStatus(runId: number, action: 'pause' | 'resume'): Promise<void> {
        this.statusRequest++;
        this.changingStatus.set(true);
        this.startError.set('');
        try {
            const run: ParserRun = await this.service.changeStatus(runId, action);
            this.latest.update(
                (page: ParserRunsPage | null) =>
                    page && {
                        ...page,
                        data: page.data.map((entry: ParserRun) =>
                            entry.id === run.id ? run : entry,
                        ),
                    },
            );
        } catch {
            this.startError.set(
                action === 'pause'
                    ? 'Не удалось поставить запуск на паузу.'
                    : 'Не удалось возобновить запуск.',
            );
        } finally {
            this.changingStatus.set(false);
            await this.refresh();
        }
    }

    private async startRun(enqueue: () => Promise<ParserRun>): Promise<void> {
        this.starting.set(true);
        this.startError.set('');
        try {
            const run: ParserRun = await enqueue();
            this.latest.update((current: ParserRunsPage | null) => ({
                data: [run, ...(current?.data ?? [])].slice(0, 25),
                current_page: 1,
                last_page: current?.last_page ?? 1,
            }));
            await this.selectPage(1);
        } catch (error: unknown) {
            const status: number | undefined =
                error instanceof HttpErrorResponse ? error.status : undefined;
            if (status === 409) {
                this.startError.set('Парсер уже запущен.');
            } else if (status === 422) {
                this.startError.set('В запуске нет товаров для повторной загрузки.');
            } else {
                this.startError.set('Не удалось запустить парсер.');
            }
        } finally {
            this.starting.set(false);
            await this.refresh();
        }
    }

    protected errorCount(run: ParserRun): number {
        return run.errors + (run.status === 'failed' && run.message ? 1 : 0);
    }

    protected toggleErrors(runId: number): void {
        if (this.expandedRun() === runId) {
            this.expandedRun.set(null);
            this.errorsRequest++;
            return;
        }

        this.expandedRun.set(runId);
        void this.loadErrors(runId, 1);
    }

    protected async loadErrors(runId: number, page: number): Promise<void> {
        const request: number = ++this.errorsRequest;
        this.errorsPage.set(null);
        this.errorsLoadFailed.set(false);
        try {
            const response: ParserRunErrorsPage = await this.service.errors(runId, page);
            if (request === this.errorsRequest) {
                this.errorsPage.set(response);
            }
        } catch {
            if (request === this.errorsRequest) {
                this.errorsLoadFailed.set(true);
            }
        }
    }

    protected async refresh(): Promise<void> {
        if (this.refreshing || this.starting() || this.changingStatus()) return;
        this.refreshing = true;
        const statusRequest: number = this.statusRequest;
        try {
            const response: ParserRunsPage = await this.service.index(1);
            if (
                !this.starting() &&
                statusRequest === this.statusRequest &&
                (response.data[0]?.id ?? 0) >= (this.latest()?.data[0]?.id ?? 0)
            ) {
                this.latest.set(response);
            }
            this.loadError.set('');
        } catch {
            this.loadError.set('Не удалось обновить историю запусков.');
        } finally {
            this.refreshing = false;
            this.loading.set(false);
        }
    }
}
