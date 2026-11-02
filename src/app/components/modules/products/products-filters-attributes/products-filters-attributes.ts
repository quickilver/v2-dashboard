import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { IconComponent } from '../../../icon/icon';
import { AttributeService } from '../../../../services/attribute.service';
import { AttributeShortModel } from '../../../../models/attributes/attribute-short.model';
import { AttributeValueModel } from '../../../../models/attributes/attribute-value.model';
import { ProductAttributeFilter } from '../../../../models/products/product-filters.model';
import { AutocompleteAttributesFieldComponent } from '../../../fields/autocomplete-attributes-field/autocomplete-attributes-field';

interface AttributeFilterView {
    id: number;
    title: string;
    values: AttributeValueModel[];
    selectedValues: number[];
    loading: boolean;
}

@Component({
    selector: 'app-products-filters-attributes',
    standalone: true,
    imports: [IconComponent, AutocompleteAttributesFieldComponent],
    templateUrl: './products-filters-attributes.html',
    styleUrl: './products-filters-attributes.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFiltersAttributesComponent {
    private readonly attributeService = inject(AttributeService);

    value = model<ProductAttributeFilter[]>([]);

    expanded = signal<boolean>(false);
    expandedGroups = signal<Record<number, boolean>>({});

    private titles = signal<Record<number, string>>({});
    private values = signal<Record<number, AttributeValueModel[]>>({});
    private loadingValues = signal<Record<number, boolean>>({});

    count = computed<number>(() => this.value().length);

    selectedIds = computed<number[]>(() => this.value().map((filter) => filter.id));

    filters = computed<AttributeFilterView[]>(() => {
        const titles = this.titles();
        const values = this.values();
        const loadingValues = this.loadingValues();

        return this.value().map((filter) => ({
            id: filter.id,
            title: titles[filter.id] ?? `#${filter.id}`,
            values: values[filter.id] ?? [],
            selectedValues: filter.values,
            loading: loadingValues[filter.id] ?? false,
        }));
    });

    toggle(): void {
        this.expanded.update((expanded) => !expanded);
    }

    isExpanded(attributeId: number): boolean {
        return this.expandedGroups()[attributeId] ?? true;
    }

    toggleGroup(attributeId: number): void {
        this.expandedGroups.update((groups) => ({
            ...groups,
            [attributeId]: !this.isExpanded(attributeId),
        }));
    }

    select(attribute: AttributeShortModel): void {
        this.titles.update((titles) => ({ ...titles, [attribute.id]: attribute.title }));

        if (!this.value().some((filter) => filter.id === attribute.id)) {
            this.value.set([...this.value(), { id: attribute.id, values: [] }]);
            this.loadValues(attribute.id);
        }
    }

    private async loadValues(attributeId: number): Promise<void> {
        this.loadingValues.update((state) => ({ ...state, [attributeId]: true }));

        try {
            const response = await this.attributeService.show(attributeId);
            this.values.update((state) => ({ ...state, [attributeId]: response.data.values }));
        } catch {
            this.values.update((state) => ({ ...state, [attributeId]: [] }));
        } finally {
            this.loadingValues.update((state) => ({ ...state, [attributeId]: false }));
        }
    }

    isValueSelected(attributeId: number, valueId: number): boolean {
        const filter = this.value().find((item) => item.id === attributeId);
        return filter?.values.includes(valueId) ?? false;
    }

    onValueToggle(attributeId: number, valueId: number, event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;

        this.value.set(
            this.value().map((filter) => {
                if (filter.id !== attributeId) return filter;

                const values = checked
                    ? [...filter.values, valueId]
                    : filter.values.filter((id) => id !== valueId);

                return { ...filter, values };
            }),
        );
    }

    remove(attributeId: number): void {
        this.value.set(this.value().filter((filter) => filter.id !== attributeId));
        this.expandedGroups.update((groups) => {
            const { [attributeId]: _removed, ...rest } = groups;
            return rest;
        });
    }
}
