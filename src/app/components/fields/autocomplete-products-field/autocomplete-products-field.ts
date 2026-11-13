import { ChangeDetectionStrategy, Component, Signal, computed, inject, model } from '@angular/core';
import { AutocompleteBaseComponent } from '../autocomplete-field/autocomplete-field';
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
export class AutocompleteProductsFieldComponent extends AutocompleteBaseComponent<ProductIndex> {
    private readonly productService = inject(ProductService);

    value = model<ProductIndex | null>(null);

    readonly filteredItems: Signal<ProductIndex[]> = computed<ProductIndex[]>(() => {
        const query: string = this.search().toLowerCase().trim();

        if (!query) {
            return [];
        }

        return this.items().filter(
            (product) =>
                product.title.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query),
        );
    });

    override readonly selectedLabel: Signal<string> = computed<string>(
        () => this.value()?.title ?? '',
    );

    selectItem(product: ProductIndex): void {
        this.value.set(product);
        this.search.set('');
        this.items.set([]);
        this.close();
    }

    override clearSelection(): void {
        this.value.set(null);
        super.clearSelection();
    }

    protected async fetchItems(query: string): Promise<ProductIndex[]> {
        const response = await this.productService.index({ query, per_page: 10 });

        return response.data;
    }
}
