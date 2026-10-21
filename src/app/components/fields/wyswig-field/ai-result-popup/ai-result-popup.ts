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
    hasError = signal<boolean>(false);
    resultHtml = signal<string>('');

    ngOnInit(): void {
        this.fetchResult();
    }

    private async fetchResult(): Promise<void> {
        this.loading.set(true);
        this.hasError.set(false);
        try {
            const html = await this.request()!();
            this.resultHtml.set(html);
        } catch {
            this.hasError.set(true);
            this.resultHtml.set('<p style="color:red">Ошибка при обработке запроса</p>');
        } finally {
            this.loading.set(false);
        }
    }

    apply(): void {
        this.onApply()();
        this.popupService.resolve();
    }

    reject(): void {
        this.popupService.resolve();
    }
}
