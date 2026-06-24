import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    forwardRef,
    OnInit,
} from '@angular/core';
import { CategoriesService } from '../../services/categories.service';
import { IconComponent } from '../icon/icon';
import { CategoryTreeNodeModel } from '../../models/category-tree-node.model';
import { Category } from '../../models/category.model';
import { PopupService } from '../../services/popup.service';
import { DropdownFieldComponent } from '../fields/dropdown-field/dropdown-field';
import { DropdownOption } from '../../models/dropdown.model';
import { NotificationService } from '../../services/notification.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
    selector: 'app-categories-tree',
    standalone: true,
    imports: [IconComponent, forwardRef(() => CategoriesTreeComponent), DropdownFieldComponent],
    templateUrl: './categories-tree.html',
    styleUrl: './categories-tree.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesTreeComponent implements OnInit {
    private readonly confirmService = inject(ConfirmService);
    private readonly notificationsService = inject(NotificationService);
    private readonly categoriesService = inject(CategoriesService);
    private readonly popupService = inject(PopupService);

    selectable = input<boolean>(false);
    editable = input<boolean>(false);
    multiple = input<boolean>(false);
    parentId = input<number>(0);
    value = model<number | number[] | null>(null);

    nodes = signal<CategoryTreeNodeModel[]>([]);
    loading = signal(false);
    loaded = signal(false);

    async ngOnInit(): Promise<void> {
        await this.load();
    }

    async load(): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.categoriesService.index({
                parent_id: this.parentId(),
                per_page: 100,
                sort: 'position',
                direction: 'desc',
            });
            this.nodes.set(
                response.data.map((category) => ({
                    category,
                    expanded: false,
                })),
            );
            this.loaded.set(true);
        } finally {
            this.loading.set(false);
        }
    }

    toggleNode(node: CategoryTreeNodeModel): void {
        node.expanded = !node.expanded;
        this.nodes.set([...this.nodes()]);
    }

    selectNode(category: Category): void {
        if (this.multiple()) {
            const current = Array.isArray(this.value()) ? [...(this.value() as number[])] : [];
            const index = current.indexOf(category.id);
            if (index >= 0) {
                current.splice(index, 1);
            } else {
                current.push(category.id);
            }
            this.value.set(current);
        } else {
            if (this.value() === category.id) {
                this.value.set(null);
            } else {
                this.value.set(category.id);
            }
        }
    }

    isSelected(categoryId: number): boolean {
        if (this.multiple()) {
            return Array.isArray(this.value()) && (this.value() as number[]).includes(categoryId);
        }
        return this.value() === categoryId;
    }

    async onCreate(parentId: number): Promise<void> {
        const { CategoriesEditorComponent } =
            await import('../modules/categories/categories-editor/categories-editor');
        this.popupService
            .open('Создание категории', CategoriesEditorComponent, { parentId })
            .then(() => {
                this.load();
            });
    }

    onChangePosition(category: Category, event: Event): void {
        const input = event.target as HTMLInputElement;

        category.position = Number(input.value);

        this.categoriesService
            .update(category.id, category)
            .then(() => {
                this.notificationsService.success('Позиция обновлена');
                this.load();
            })
            .catch((e) => {
                this.notificationsService.error(
                    e.error?.message || 'Ошибка при обновлении позиции',
                );
            });
    }

    async onClick(category: Category): Promise<void> {
        if (this.selectable()) {
            this.selectNode(category);
        }

        if (this.editable()) {
            const { CategoriesEditorComponent } =
                await import('../modules/categories/categories-editor/categories-editor');
            this.popupService
                .open('Редактирование категории', CategoriesEditorComponent, { id: category.id })
                .then(() => {
                    this.load();
                });
        }
    }

    onDeleteClick(category: Category): void {
        this.confirmService
            .confirm('Удаление категории', 'Удалить категорию ' + category.title + '?')
            .then(() => {
                this.categoriesService
                    .delete(category.id)
                    .then(() => {
                        this.notificationsService.success('Категория удалена');
                        this.load();
                    })
                    .catch((e) => {
                        this.notificationsService.error(e.error.message);
                    });
            });
    }

    getRowActions(item: any): DropdownOption[] {
        return [
            {
                label: 'Редактировать',
                action: () => this.onClick(item),
            },
            {
                label: 'Удалить',
                action: () => this.onDeleteClick(item),
            },
        ];
    }
}
