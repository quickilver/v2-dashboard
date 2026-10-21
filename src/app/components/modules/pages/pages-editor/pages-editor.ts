import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    OnInit,
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CheckboxFieldComponent } from '../../../fields/checkbox-field/checkbox-field';
import { WyswigFieldComponent } from '../../../fields/wyswig-field/wyswig-field';
import { PageService } from '../../../../services/page.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { PageModel } from '../../../../models/page.model';

@Component({
    selector: 'app-pages-editor',
    standalone: true,
    imports: [InputFieldComponent, CheckboxFieldComponent, WyswigFieldComponent],
    templateUrl: './pages-editor.html',
    styleUrl: './pages-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesEditorComponent implements OnInit {
    private readonly pageService = inject(PageService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    title = model<string>('');
    alias = model<string>('');
    h1 = model<string>('');
    display = model<boolean>(false);

    seoTitle = model<string>('');
    seoDescription = model<string>('');
    seoKeywords = model<string>('');

    content = model<string>('');

    ngOnInit(): void {
        const pageId = this.id();
        if (pageId) {
            this.isEditMode.set(true);
            this.loadPage(pageId);
        }
    }

    private async loadPage(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.pageService.show(id);
            const page = response.data;
            this.title.set(page.title);
            this.alias.set(page.alias);
            this.h1.set(page.h1 ?? '');
            this.display.set(page.display);
            this.seoTitle.set(page.seo_title ?? '');
            this.seoDescription.set(page.seo_description ?? '');
            this.seoKeywords.set(page.seo_keywords ?? '');
            this.content.set(page.content ?? '');
        } catch {
            this.notificationService.error('Не удалось загрузить данные страницы');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<PageModel> = {
                title: this.title().trim(),
                alias: this.alias().trim(),
                h1: this.h1().trim() || null,
                display: this.display(),
                seo_title: this.seoTitle().trim() || null,
                seo_description: this.seoDescription().trim() || null,
                seo_keywords: this.seoKeywords().trim() || null,
                content: this.content() || null,
            };

            if (this.isEditMode()) {
                await this.pageService.update(this.id()!, data);
            } else {
                await this.pageService.create(data);
            }

            this.notificationService.success('Страница успешно сохранена');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(response.error?.message || 'Ошибка при сохранении страницы');
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }

    isActiveTab(tab: string): boolean {
        return this.tab() === tab;
    }

    changeTab(tab: string): void {
        this.tab.set(tab);
    }
}