import { AfterViewInit, Component, ElementRef, inject, input, model, ViewChild } from '@angular/core';
import { DropdownFieldComponent } from '../dropdown-field/dropdown-field';
import { DropdownOption } from '../../../models/dropdown.model';
import { OpenRouterService } from '../../../services/open-router.service';
import { PopupService } from '../../../services/popup.service';
import { AiResultPopupComponent } from './ai-result-popup/ai-result-popup';

@Component({
    selector: 'app-wyswig-field',
    standalone: true,
    imports: [
        DropdownFieldComponent
    ],
    templateUrl: './wyswig-field.html',
    styleUrl: './wyswig-field.scss',
})
export class WyswigFieldComponent implements AfterViewInit {
    private readonly openRouter = inject(OpenRouterService);
    private readonly popupService = inject(PopupService);

    label = input<string>('');
    value = model<string>('');
    placeholder = input<string>('');

    aiOptions: DropdownOption[] = [
        {
            label: 'Форматировать',
            action: () => this.formatContent(),
        },
        {
            label: 'Преобразовать',
            action: () => this.transformContent(),
        },
    ];

    @ViewChild('editorEl', { static: true })
    private editorRef!: ElementRef<HTMLDivElement>;

    ngAfterViewInit(): void {
        this.editorRef.nativeElement.innerHTML = this.value() || '';
    }

    executeCommand(command: string): void {
        document.execCommand(command, false);
    }

    changeFontSize(size: string): void {
        document.execCommand('fontSize', false, size);
    }

    private async formatContent(): Promise<void> {
        const currentContent = this.value();
        if (!currentContent) return;

        const resultHolder = { html: '' };

        await this.popupService.open('Форматирование текста', AiResultPopupComponent, {
            request: async () => {
                const result = await this.openRouter.formatting(currentContent);
                resultHolder.html = result;
                return result;
            },
            onApply: () => {
                if (resultHolder.html) {
                    this.value.set(resultHolder.html);
                    this.editorRef.nativeElement.innerHTML = resultHolder.html;
                }
            },
        });
    }

    private async transformContent(): Promise<void> {
        const currentContent = this.value();
        if (!currentContent) return;

        const resultHolder = { html: '' };

        await this.popupService.open('Преобразование текста', AiResultPopupComponent, {
            request: async () => {
                const result = await this.openRouter.refactoring(currentContent);
                resultHolder.html = result;
                return result;
            },
            onApply: () => {
                if (resultHolder.html) {
                    this.value.set(resultHolder.html);
                    this.editorRef.nativeElement.innerHTML = resultHolder.html;
                }
            },
        });
    }
}
