import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    OnInit
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CheckboxFieldComponent } from '../../../fields/checkbox-field/checkbox-field';
import { CategoriesService } from '../../../../services/categories.service';
import { PopupService } from '../../../../services/popup.service';
import { Category } from '../../../../models/category.model';
import { NotificationService } from '../../../../services/notification.service';
import { CategoriesTreeComponent } from '../../../categories-tree/categories-tree';

@Component({
    selector: 'app-categories-editor',
    standalone: true,
    imports: [InputFieldComponent, CheckboxFieldComponent, CategoriesTreeComponent],
    templateUrl: './categories-editor.html',
    styleUrl: './categories-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesEditorComponent implements OnInit {
    private readonly categoriesService = inject(CategoriesService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);
    parentId = input<number>(0);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    guid = model<string>('');
    title = model<string>('');
    alias = model<string>('');
    display = model<boolean>(true);
    position = model<number>(0);
    parent = model<number | null>(null);

    ngOnInit(): void {
        const categoryId = this.id();
        if (categoryId) {
            this.loadCategory(categoryId);
        }
        if (this.parentId()) {
            this.parent.set(this.parentId());
        }
    }

    private async loadCategory(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.categoriesService.show(id);
            const category = response.data;
            this.guid.set(category.guid);
            this.title.set(category.title);
            this.alias.set(category.alias);
            this.display.set(category.display);
            this.position.set(category.position);
            this.parent.set(category.parent_id);
            this.isEditMode.set(true);
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные категории');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<Category> = {
                guid: this.guid().trim(),
                title: this.title().trim(),
                alias: this.alias().trim(),
                parent_id: this.parent(),
                display: this.display(),
                position: this.position()
            };

            if (this.isEditMode()) {
                await this.categoriesService.update(this.id()!, data);
            } else {
                await this.categoriesService.create(data);
            }

            this.notificationService.success('Категория успешно сохранена');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(response.error.message);
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
