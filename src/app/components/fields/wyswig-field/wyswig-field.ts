import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    inject,
    input,
    model,
    signal,
    ViewChild,
} from '@angular/core';
import { DropdownFieldComponent } from '../dropdown-field/dropdown-field';
import { DropdownOption } from '../../../models/dropdown.model';
import { OpenRouterService } from '../../../services/open-router.service';
import { PopupService } from '../../../services/popup.service';
import { FileManagerService } from '../../../services/file-manager.service';
import { FileManagerPopupComponent } from '../../file-manager/file-manager-popup/file-manager-popup';
import { FileManagerFileEntry } from '../../../models/responses/file-manager/file-manager-file-entry.model';
import { AiResultPopupComponent } from './ai-result-popup/ai-result-popup';
import { WyswigMediaSettingsComponent } from './wyswig-media-settings/wyswig-media-settings';

@Component({
    selector: 'app-wyswig-field',
    standalone: true,
    imports: [DropdownFieldComponent, WyswigMediaSettingsComponent],
    templateUrl: './wyswig-field.html',
    styleUrl: './wyswig-field.scss',
})
export class WyswigFieldComponent implements AfterViewInit {
    private readonly openRouter = inject(OpenRouterService);
    private readonly popupService = inject(PopupService);
    private readonly fileManagerService = inject(FileManagerService);

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

    @ViewChild(WyswigMediaSettingsComponent, { read: ElementRef })
    private mediaSettingsRef?: ElementRef<HTMLElement>;

    private savedRange: Range | null = null;

    readonly selectedImage = signal<HTMLImageElement | null>(null);
    readonly imageWidth = signal<number | null>(null);
    readonly imageHeight = signal<number | null>(null);
    readonly lockRatio = signal<boolean>(true);
    readonly imageRatio = signal<number | null>(null);

    ngAfterViewInit(): void {
        this.editorRef.nativeElement.innerHTML = this.value() || '';
    }

    executeCommand(command: string): void {
        document.execCommand(command, false);
    }

    changeFontSize(size: string): void {
        document.execCommand('fontSize', false, size);
    }

    saveSelection(): void {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        if (this.editorRef.nativeElement.contains(range.commonAncestorContainer)) {
            this.savedRange = range.cloneRange();
        }
    }

    async insertFile(): Promise<void> {
        this.saveSelection();

        const file = await this.popupService.open<FileManagerFileEntry>(
            'Файловый менеджер',
            FileManagerPopupComponent,
        );

        if (!file) return;

        this.insertHtml(this.buildFileHtml(file));
    }

    onEditorClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;

        if (target instanceof HTMLImageElement) {
            this.selectImage(target);
            return;
        }

        this.closeImagePanel();
    }

    private selectImage(image: HTMLImageElement): void {
        this.clearImageHighlight();

        this.selectedImage.set(image);
        image.classList.add('is-selected');

        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        this.imageRatio.set(width > 0 && height > 0 ? width / height : null);

        this.imageWidth.set(Math.round(image.width) || width || null);
        this.imageHeight.set(Math.round(image.height) || height || null);
    }

    onImageWidthChange(width: number | null): void {
        this.imageWidth.set(width);
        this.applyImageSize();
    }

    onImageHeightChange(height: number | null): void {
        this.imageHeight.set(height);
        this.applyImageSize();
    }

    onLockRatioChange(lockRatio: boolean): void {
        this.lockRatio.set(lockRatio);
    }

    private applyImageSize(): void {
        const image = this.selectedImage();
        if (!image) return;

        const width = this.imageWidth();
        const height = this.imageHeight();

        this.applySize(image, 'width', width);
        this.applySize(image, 'height', height);

        // CSS `.editor img { max-width: 100%; height: auto }` перебивает атрибуты,
        // поэтому заданный размер фиксируем inline-стилями.
        image.style.maxWidth = width !== null ? 'none' : '';
        image.style.height = height !== null ? `${height}px` : '';

        this.syncValue();
    }

    removeImage(): void {
        const image = this.selectedImage();
        if (!image) return;

        image.remove();
        this.closeImagePanel();
        this.syncValue();
    }

    closeImagePanel(): void {
        this.clearImageHighlight();
        this.selectedImage.set(null);
        this.imageWidth.set(null);
        this.imageHeight.set(null);
        this.imageRatio.set(null);
    }

    private clearImageHighlight(): void {
        const image = this.selectedImage();
        if (image) {
            image.classList.remove('is-selected');
        }
    }

    private applySize(
        image: HTMLImageElement,
        dimension: 'width' | 'height',
        value: number | null,
    ): void {
        if (value !== null) {
            image.style[dimension] = `${value}px`;
        } else {
            image.style.removeProperty(dimension);
        }
    }

    private syncValue(): void {
        const image = this.selectedImage();
        const hadHighlight = image?.classList.contains('is-selected') ?? false;

        if (image && hadHighlight) {
            image.classList.remove('is-selected');
        }

        this.value.set(this.editorRef.nativeElement.innerHTML);

        if (image && hadHighlight) {
            image.classList.add('is-selected');
        }
    }

    @HostListener('document:mousedown', ['$event'])
    onDocumentMouseDown(event: MouseEvent): void {
        const target = event.target as Node | null;
        if (!target) return;

        const panel = this.mediaSettingsRef?.nativeElement;
        if (panel?.contains(target)) {
            return;
        }

        if (this.editorRef.nativeElement.contains(target)) {
            return;
        }

        this.closeImagePanel();
    }

    private buildFileHtml(file: FileManagerFileEntry): string {
        const url = this.fileManagerService.publicUrl(file.path);

        if (file.mime_type.startsWith('image/')) {
            return `<img src="${url}" alt="${file.name}" />`;
        }

        return `<a href="${url}" target="_blank" rel="noopener">${file.name}</a>`;
    }

    private insertHtml(html: string): void {
        const editor = this.editorRef.nativeElement;
        editor.focus();

        const selection = window.getSelection();
        if (selection && this.savedRange) {
            selection.removeAllRanges();
            selection.addRange(this.savedRange);
        }

        document.execCommand('insertHTML', false, html);
        this.savedRange = null;
        this.value.set(editor.innerHTML);
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
