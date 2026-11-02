import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { CategoriesTreeComponent } from '../../categories-tree/categories-tree';
import { SkeletonComponent } from '../../skeleton/skeleton';
import { ProductService } from '../../../services/product.service';
import { PopupService } from '../../../services/popup.service';
import { NotificationService } from '../../../services/notification.service';
import { ProductIndex } from '../../../models/products/product-short.model';

@Component({
    selector: 'app-popup-product-field',
    standalone: true,
    imports: [CategoriesTreeComponent, SkeletonComponent],
    templateUrl: './popup-product-field.html',
    styleUrl: './popup-product-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupProductFieldComponent {
    private readonly productService = inject(ProductService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    multiple = input<boolean>(true);

    categoryId = model<number | number[] | null>(null);
    selectedProducts = signal<ProductIndex[]>([]);

    products = signal<ProductIndex[]>([]);
    loading = signal<boolean>(false);
    showSelected = signal<boolean>(false);

    selectedIds = computed<number[]>(() => this.selectedProducts().map((product) => product.id));

    onCategoryChange(categoryId: number | number[] | null): void {
        this.showSelected.set(false);
        this.categoryId.set(categoryId);
        this.loadProducts();
    }

    showSelectedProducts(): void {
        this.categoryId.set(null);
        this.showSelected.set(true);
        this.products.set(this.selectedProducts());
    }

    private async loadProducts(): Promise<void> {
        const categoryId: number | null = Array.isArray(this.categoryId())
            ? ((this.categoryId() as number[])[0] ?? null)
            : (this.categoryId() as number | null);

        if (!categoryId) {
            this.products.set([]);
            return;
        }

        this.loading.set(true);
        try {
            const response = await this.productService.index({
                categories: [categoryId],
                per_page: 100,
            });
            this.products.set(response.data);
        } catch {
            this.products.set([]);
            this.notificationService.error('Не удалось загрузить товары категории');
        } finally {
            this.loading.set(false);
        }
    }

    isSelected(productId: number): boolean {
        return this.selectedIds().includes(productId);
    }

    toggleProduct(product: ProductIndex): void {
        if (!this.multiple()) {
            this.selectedProducts.set([product]);
            return;
        }

        const isRemoving: boolean = this.isSelected(product.id);

        this.selectedProducts.update((products) =>
            isRemoving ? products.filter((item) => item.id !== product.id) : [...products, product],
        );

        if (isRemoving && this.showSelected()) {
            this.products.update((products) => products.filter((item) => item.id !== product.id));
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }

    onConfirm(): void {
        this.popupService.resolve(this.selectedProducts());
    }
}
