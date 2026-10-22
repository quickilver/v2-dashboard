import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CategoriesTreeComponent } from '../../../categories-tree/categories-tree';
import { ProductService } from '../../../../services/product.service';
import { PriceService } from '../../../../services/price.service';
import { StoreService } from '../../../../services/store.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { PriceModel } from '../../../../models/price.model';
import { StoreModel } from '../../../../models/store.model';
import { ProductPriceRequest, ProductStoreRequest, ProductCreateRequest } from '../../../../models/products/product-create-request.model';

@Component({
    selector: 'app-products-editor',
    standalone: true,
    imports: [
        FormsModule,
        InputFieldComponent,
        CategoriesTreeComponent,
    ],
    templateUrl: './products-editor.html',
    styleUrl: './products-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsEditorComponent implements OnInit {
    private readonly productService = inject(ProductService);
    private readonly priceService = inject(PriceService);
    private readonly storeService = inject(StoreService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    title = model<string>('');
    sku = model<string>('');
    categories = model<number | number[] | null>(null);

    prices = signal<PriceModel[]>([]);
    stores = signal<StoreModel[]>([]);

    priceAmounts = signal<Record<number, number>>({});
    storeCounts = signal<Record<number, number>>({});

    ngOnInit(): void {
        const productId = this.id();
        if (productId) {
            this.isEditMode.set(true);
            this.loadProduct(productId);
        }

        this.loadPrices();
        this.loadStores();
    }

    private async loadProduct(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.productService.show(id);
            const product = response.data;
            this.title.set(product.title);
            this.sku.set(product.sku);

            if (product.categories && product.categories.length > 0) {
                this.categories.set(product.categories.map((c) => c.id));
            }

            const priceAmounts: Record<number, number> = {};
            for (const price of product.prices) {
                priceAmounts[price.id] = price.amount;
            }
            this.priceAmounts.set(priceAmounts);

            const storeCounts: Record<number, number> = {};
            for (const store of product.stores) {
                storeCounts[store.id] = store.count;
            }
            this.storeCounts.set(storeCounts);
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные товара');
        } finally {
            this.loading.set(false);
        }
    }

    private async loadPrices(): Promise<void> {
        try {
            const response = await this.priceService.index({ per_page: 100 });
            this.prices.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить типы цен');
        }
    }

    private async loadStores(): Promise<void> {
        try {
            const response = await this.storeService.index({ per_page: 100 });
            this.stores.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить склады');
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const categoryIds: number[] = this.getCategoryIds();

            const prices: ProductPriceRequest[] = this.prices()
                .filter((price) => {
                    const amount = this.priceAmounts()[price.id];
                    return amount !== undefined && amount > 0;
                })
                .map((price) => ({
                    id: price.id,
                    amount: this.priceAmounts()[price.id] ?? 0,
                }));

            const stores: ProductStoreRequest[] = this.stores()
                .filter((store) => {
                    const count = this.storeCounts()[store.id];
                    return count !== undefined && count >= 0;
                })
                .map((store) => ({
                    id: store.id,
                    count: this.storeCounts()[store.id] ?? 0,
                }));

            const data: ProductCreateRequest = {
                title: this.title().trim(),
                sku: this.sku().trim(),
                categories: categoryIds,
                attribute_values: [],
                prices,
                stores,
            };

            if (this.isEditMode()) {
                await this.productService.update(this.id()!, data);
            } else {
                await this.productService.create(data);
            }

            this.notificationService.success('Товар успешно сохранён');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(response.error?.message ?? 'Ошибка при сохранении товара');
        } finally {
            this.saving.set(false);
        }
    }

    private getCategoryIds(): number[] {
        const value = this.categories();
        if (value === null || value === undefined) {
            return [];
        }
        if (Array.isArray(value)) {
            return value;
        }
        return [value];
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

    onPriceAmountChange(priceId: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        const amounts = { ...this.priceAmounts() };
        amounts[priceId] = parseFloat(input.value) || 0;
        this.priceAmounts.set(amounts);
    }

    onStoreCountChange(storeId: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        const counts = { ...this.storeCounts() };
        counts[storeId] = parseInt(input.value, 10) || 0;
        this.storeCounts.set(counts);
    }
}
