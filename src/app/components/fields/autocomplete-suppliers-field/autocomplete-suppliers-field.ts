import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
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
export class AutocompleteSuppliersFieldComponent {
    private readonly supplierService = inject(SupplierService);

    label = input<string>('');
    placeholder = input<string>('');

    search = model<string>('');
    value = model<SupplierModel | null>(null);

    isOpen = signal<boolean>(false);
    loading = signal<boolean>(false);
    activeIndex = signal<number>(-1);
    suppliers = signal<SupplierModel[]>([]);

    filteredSuppliers = computed<SupplierModel[]>(() => {
        const query: string = this.search().toLowerCase().trim();
        if (!query) return [];

        return this.suppliers().filter((supplier) => supplier.title.toLowerCase().includes(query));
    });

    async onInput(event: Event): Promise<void> {
        const query: string = (event.target as HTMLInputElement).value;
        this.search.set(query);
        this.activeIndex.set(-1);

        if (query.trim().length === 0) {
            this.isOpen.set(false);
            this.suppliers.set([]);
            return;
        }

        this.loading.set(true);
        this.isOpen.set(true);

        try {
            const response = await this.supplierService.index({ query, per_page: 10 });
            this.suppliers.set(response.data);
        } catch {
            this.suppliers.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    selectSupplier(supplier: SupplierModel): void {
        this.search.set(supplier.title);
        this.value.set(supplier);
        this.isOpen.set(false);
        this.activeIndex.set(-1);
    }

    onKeydown(event: KeyboardEvent): void {
        const options: SupplierModel[] = this.filteredSuppliers();

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextIndex: number = this.activeIndex() + 1;
            this.activeIndex.set(nextIndex >= options.length ? 0 : nextIndex);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const previousIndex: number = this.activeIndex() - 1;
            this.activeIndex.set(previousIndex < 0 ? options.length - 1 : previousIndex);
        } else if (event.key === 'Enter' && this.activeIndex() >= 0) {
            event.preventDefault();
            this.selectSupplier(options[this.activeIndex()]);
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
