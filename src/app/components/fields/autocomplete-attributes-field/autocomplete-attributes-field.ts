import {
    ChangeDetectionStrategy,
    Component,
    Signal,
    computed,
    inject,
    input,
    output,
} from '@angular/core';
import { AutocompleteBaseComponent } from '../autocomplete-field/autocomplete-field';
import { AttributeService } from '../../../services/attribute.service';
import { AttributeShortModel } from '../../../models/attributes/attribute-short.model';

@Component({
    selector: 'app-autocomplete-attributes-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-attributes-field.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteAttributesFieldComponent extends AutocompleteBaseComponent<AttributeShortModel> {
    private readonly attributeService = inject(AttributeService);

    excludeIds = input<number[]>([]);
    selected = output<AttributeShortModel>();

    protected override readonly debounceMs: number = 300;

    readonly filteredItems: Signal<AttributeShortModel[]> = computed<AttributeShortModel[]>(() => {
        const excludedIds: number[] = this.excludeIds();

        return this.items().filter((attribute) => !excludedIds.includes(attribute.id));
    });

    selectItem(attribute: AttributeShortModel): void {
        this.selected.emit(attribute);
        this.search.set('');
        this.items.set([]);
        this.close();
    }

    protected async fetchItems(query: string): Promise<AttributeShortModel[]> {
        const response = await this.attributeService.index({ query, per_page: 10 });

        return response.data;
    }
}
