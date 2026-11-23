import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { PopupService } from '../../../../services/popup.service';

@Component({
    selector: 'app-ai-result-popup',
    standalone: true,
    imports: [],
    templateUrl: './ai-result-popup.html',
    styleUrl: './ai-result-popup.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiResultPopupComponent implements OnInit {
    private readonly popupService = inject(PopupService);

    readonly request = input<() => Promise<string>>();
    readonly onApply = input<() => void>(() => {});

    loading = signal<boolean>(true);
    errorMessage = signal<string | null>(null);
    resultHtml = signal<string>('');

    ngOnInit(): void {
        this.fetchResult();
    }

    private async fetchResult(): Promise<void> {
        this.loading.set(true);
        this.errorMessage.set(null);
        try {
            const html = await this.request()!();
            this.resultHtml.set(html);
        } catch (error: unknown) {
            this.errorMessage.set(this.getErrorMessage(error));
        } finally {
            this.loading.set(false);
        }
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            const body: { code?: unknown; message?: unknown } | null = error.error;
            if (
                typeof body?.code === 'string' &&
                body.code.startsWith('openrouter_') &&
                typeof body.message === 'string'
            ) {
                return body.message;
            }

            switch (error.status) {
                case 0:
                    return 'Не удалось связаться с API. Проверьте подключение и повторите попытку.';
                case 401:
                    return 'Сеанс завершён. Войдите в дашборд заново.';
                case 422:
                    return 'API не принял текст. Проверьте содержимое редактора.';
                case 504:
                    return 'Сервер не успел обработать запрос. Повторите попытку позже.';
                default:
                    return `Ошибка API (HTTP ${error.status}). Повторите попытку позже.`;
            }
        }

        return 'Не удалось обработать текст. Повторите попытку позже.';
    }

    apply(): void {
        this.onApply()();
        this.popupService.resolve();
    }

    reject(): void {
        this.popupService.resolve();
    }
}
