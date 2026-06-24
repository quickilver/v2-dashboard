import {
    Component,
    computed,
    input,
    model,
    ChangeDetectionStrategy,
    signal,
    inject,
} from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { ProductIndex } from '../../../models/products/product-short.model';

@Component({
    selector: 'app-autocomplete-products-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-products-field.html',
    styleUrl: './autocomplete-products-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteProductsFieldComponent {
    private readonly productService = inject(ProductService);

    label = input<string>('');
    placeholder = input<string>('');

    search = model<string>('');
    value = model<ProductIndex | null>(null);

    isOpen = signal<boolean>(false);
    loading = signal<boolean>(false);
    activeIndex = signal<number>(-1);
    products = signal<ProductIndex[]>([]);

    filteredProducts = computed(() => {
        const query = this.search().toLowerCase().trim();
        if (!query) return [];

        return this.products().filter(
            (product) =>
                product.title.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query),
        );
    });

    async onInput(event: Event): Promise<void> {
        const value = (event.target as HTMLInputElement).value;
        this.search.set(value);
        this.activeIndex.set(-1);

        if (value.trim().length === 0) {
            this.isOpen.set(false);
            return;
        }

        this.loading.set(true);
        this.isOpen.set(true);

        try {
            const response = await this.productService.index({ query: value, per_page: 10 });
            this.products.set(response.data);
        } catch {
            this.products.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    selectProduct(product: ProductIndex): void {
        this.search.set(product.title);
        this.value.set(product);
        this.isOpen.set(false);
        this.activeIndex.set(-1);
    }

    onKeydown(event: KeyboardEvent): void {
        const options = this.filteredProducts();

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const next = this.activeIndex() + 1;
            this.activeIndex.set(next >= options.length ? 0 : next);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prev = this.activeIndex() - 1;
            this.activeIndex.set(prev < 0 ? options.length - 1 : prev);
        } else if (event.key === 'Enter' && this.activeIndex() >= 0) {
            event.preventDefault();
            this.selectProduct(options[this.activeIndex()]);
        } else if (event.key === 'Escape') {
            this.isOpen.set(false);
            this.activeIndex.set(-1);
        }
    }

    close(): void {
        this.isOpen.set(false);
        this.activeIndex.set(-1);
    }
}
