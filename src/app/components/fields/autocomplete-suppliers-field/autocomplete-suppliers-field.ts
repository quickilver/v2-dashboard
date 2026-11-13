import { ChangeDetectionStrategy, Component, Signal, computed, inject, model } from '@angular/core';
import { AutocompleteBaseComponent } from '../autocomplete-field/autocomplete-field';
import { SupplierService } from '../../../services/supplier.service';
import { SupplierModel } from '../../../models/supplier.model';

@Component({
    selector: 'app-autocomplete-suppliers-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-suppliers-field.html',
    styleUrl: './autocomplete-suppliers-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteSuppliersFieldComponent extends AutocompleteBaseComponent<SupplierModel> {
    private readonly supplierService = inject(SupplierService);

    value = model<SupplierModel | null>(null);

    readonly filteredItems: Signal<SupplierModel[]> = computed<SupplierModel[]>(() => {
        const query: string = this.search().toLowerCase().trim();

        if (!query) {
            return [];
        }

        return this.items().filter((supplier) => supplier.title.toLowerCase().includes(query));
    });

    override readonly selectedLabel: Signal<string> = computed<string>(
        () => this.value()?.title ?? '',
    );

    selectItem(supplier: SupplierModel): void {
        this.value.set(supplier);
        this.search.set('');
        this.items.set([]);
        this.close();
    }

    override clearSelection(): void {
        this.value.set(null);
        super.clearSelection();
    }

    protected async fetchItems(query: string): Promise<SupplierModel[]> {
        const response = await this.supplierService.index({ query, per_page: 10 });

        return response.data;
    }
}
