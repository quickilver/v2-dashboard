import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    model,
    OnInit,
    signal,
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CategoriesTreeComponent } from '../../../categories-tree/categories-tree';
import { IconComponent } from '../../../icon/icon';
import { StoreService } from '../../../../services/store.service';
import { PriceService } from '../../../../services/price.service';
import { NotificationService } from '../../../../services/notification.service';
import { StoreModel } from '../../../../models/store.model';
import { PriceModel } from '../../../../models/price.model';
import {
    ProductAttributeFilter,
    ProductFilters,
    ProductPriceFilter,
} from '../../../../models/products/product-filters.model';
import { ProductsFiltersAttributesComponent } from '../products-filters-attributes/products-filters-attributes';

@Component({
    selector: 'app-products-filters',
    standalone: true,
    imports: [
        InputFieldComponent,
        CategoriesTreeComponent,
        IconComponent,
        ProductsFiltersAttributesComponent,
    ],
    templateUrl: './products-filters.html',
    styleUrl: './products-filters.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFiltersComponent implements OnInit {
    private readonly storeService = inject(StoreService);
    private readonly priceService = inject(PriceService);
    private readonly notificationService = inject(NotificationService);

    filters = model<ProductFilters>({
        query: '',
        categories: [],
        stores: [],
        prices: [],
        attributes: [],
    });

    stores = signal<StoreModel[]>([]);
    prices = signal<PriceModel[]>([]);

    categoriesCount = computed<number>(() => this.filters().categories.length);
    storesCount = computed<number>(() => this.filters().stores.length);
    pricesCount = computed<number>(() => this.filters().prices.length);

    expandedGroups = signal<Record<string, boolean>>({
        categories: true,
        stores: false,
        prices: false,
    });

    isExpanded(group: string): boolean {
        return this.expandedGroups()[group] ?? false;
    }

    toggleGroup(group: string): void {
        this.expandedGroups.update((groups) => ({
            ...groups,
            [group]: !groups[group],
        }));
    }

    ngOnInit(): void {
        this.loadStores();
        this.loadPrices();
    }

    private async loadStores(): Promise<void> {
        try {
            const response = await this.storeService.index({ per_page: 100 });
            this.stores.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить склады');
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

    onQueryChange(value: string | number): void {
        this.update({ query: String(value) });
    }

    onCategoriesChange(value: number | number[] | null): void {
        this.update({ categories: this.toIds(value) });
    }

    onStoreToggle(storeId: number, event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        const current = this.filters().stores;
        const stores = checked ? [...current, storeId] : current.filter((id) => id !== storeId);
        this.update({ stores });
    }

    onPriceRangeChange(priceId: number, field: 'min' | 'max', event: Event): void {
        const input = event.target as HTMLInputElement;
        const raw = input.value.trim();
        const parsed = raw === '' ? null : Number(raw);
        const value = parsed !== null && Number.isFinite(parsed) ? parsed : null;

        const current = this.filters().prices;
        const existing = current.find((item) => item.id === priceId);
        const updated: ProductPriceFilter = existing
            ? { ...existing, [field]: value }
            : { id: priceId, min: null, max: null, [field]: value };

        const prices = existing
            ? current.map((item) => (item.id === priceId ? updated : item))
            : [...current, updated];

        this.update({ prices: this.cleanPrices(prices) });
    }

    getPriceFilter(priceId: number): ProductPriceFilter | undefined {
        return this.filters().prices.find((item) => item.id === priceId);
    }

    private cleanPrices(prices: ProductPriceFilter[]): ProductPriceFilter[] {
        return prices.filter((item) => item.min !== null || item.max !== null);
    }

    isStoreSelected(storeId: number): boolean {
        return this.filters().stores.includes(storeId);
    }

    onAttributesChange(attributes: ProductAttributeFilter[]): void {
        this.update({ attributes });
    }

    reset(): void {
        this.update({ query: '', categories: [], stores: [], prices: [], attributes: [] });
    }

    private update(partial: Partial<ProductFilters>): void {
        this.filters.set({ ...this.filters(), ...partial });
    }

    private toIds(value: number | number[] | null): number[] {
        if (value === null || value === undefined) return [];
        return Array.isArray(value) ? value : [value];
    }
}
