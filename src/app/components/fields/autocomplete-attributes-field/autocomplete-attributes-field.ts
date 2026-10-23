import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    HostListener,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { AttributeService } from '../../../services/attribute.service';
import { AttributeShortModel } from '../../../models/attributes/attribute-short.model';
import { AttributeValueModel } from '../../../models/attributes/attribute-value.model';

export interface AttributeFieldValue {
    attribute_id: number | null;
    attribute_title: string;
    value_id: number | null;
    value: string;
}

@Component({
    selector: 'app-autocomplete-attributes-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-attributes-field.html',
    styleUrl: './autocomplete-attributes-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteAttributesFieldComponent {
    private readonly attributeService = inject(AttributeService);
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    label = input<string>('');
    attributePlaceholder = input<string>('Характеристика');
    valuePlaceholder = input<string>('Значение');

    value = model<AttributeFieldValue>({
        attribute_id: null,
        attribute_title: '',
        value_id: null,
        value: '',
    });

    attributeSearch = signal<string>('');
    attributes = signal<AttributeShortModel[]>([]);
    attributeOpen = signal<boolean>(false);
    attributeActiveIndex = signal<number>(-1);
    attributeLoading = signal<boolean>(false);

    valueSearch = signal<string>('');
    values = signal<AttributeValueModel[]>([]);
    valueOpen = signal<boolean>(false);
    valueActiveIndex = signal<number>(-1);

    filteredAttributes = computed(() => {
        const query = this.attributeSearch().toLowerCase().trim();
        if (!query) return [];

        return this.attributes().filter((attribute) =>
            attribute.title.toLowerCase().includes(query),
        );
    });

    filteredValues = computed(() => {
        const query = this.valueSearch().toLowerCase().trim();
        if (!query) return this.values();

        return this.values().filter((item) => item.value.toLowerCase().includes(query));
    });

    hasSelectedAttribute = computed<boolean>(() => this.value().attribute_id !== null);
    hasSelectedValue = computed<boolean>(() => this.value().value_id !== null);

    async onAttributeInput(event: Event): Promise<void> {
        const text = (event.target as HTMLInputElement).value;
        this.attributeSearch.set(text);
        this.attributeActiveIndex.set(-1);
        this.value.update((current) => ({
            ...current,
            attribute_id: null,
            attribute_title: text,
        }));

        if (text.trim().length === 0) {
            this.attributeOpen.set(false);
            return;
        }

        this.attributeLoading.set(true);
        this.attributeOpen.set(true);

        try {
            const response = await this.attributeService.index({ query: text, per_page: 10 });
            this.attributes.set(response.data);
        } catch {
            this.attributes.set([]);
        } finally {
            this.attributeLoading.set(false);
        }
    }

    async selectAttribute(attribute: AttributeShortModel): Promise<void> {
        this.attributeSearch.set(attribute.title);
        this.attributeOpen.set(false);
        this.attributeActiveIndex.set(-1);
        this.value.update((current) => ({
            ...current,
            attribute_id: attribute.id,
            attribute_title: attribute.title,
            value_id: null,
            value: '',
        }));
        this.valueSearch.set('');
        await this.loadValues(attribute.id);
    }

    private async loadValues(attributeId: number): Promise<void> {
        try {
            const response = await this.attributeService.show(attributeId);
            this.values.set(response.data.values);
        } catch {
            this.values.set([]);
        }
    }

    onValueInput(event: Event): void {
        const text = (event.target as HTMLInputElement).value;
        this.valueSearch.set(text);
        this.valueActiveIndex.set(-1);
        this.valueOpen.set(text.trim().length > 0);
        this.value.update((current) => ({
            ...current,
            value_id: null,
            value: text,
        }));
    }

    selectValue(item: AttributeValueModel): void {
        this.valueSearch.set(item.value);
        this.valueOpen.set(false);
        this.valueActiveIndex.set(-1);
        this.value.update((current) => ({
            ...current,
            value_id: item.id,
            value: item.value,
        }));
    }

    onAttributeKeydown(event: KeyboardEvent): void {
        const options = this.filteredAttributes();

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const next = this.attributeActiveIndex() + 1;
            this.attributeActiveIndex.set(next >= options.length ? 0 : next);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prev = this.attributeActiveIndex() - 1;
            this.attributeActiveIndex.set(prev < 0 ? options.length - 1 : prev);
        } else if (event.key === 'Enter' && this.attributeActiveIndex() >= 0) {
            event.preventDefault();
            this.selectAttribute(options[this.attributeActiveIndex()]);
        } else if (event.key === 'Escape') {
            this.attributeOpen.set(false);
            this.attributeActiveIndex.set(-1);
        }
    }

    onValueKeydown(event: KeyboardEvent): void {
        const options = this.filteredValues();

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const next = this.valueActiveIndex() + 1;
            this.valueActiveIndex.set(next >= options.length ? 0 : next);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prev = this.valueActiveIndex() - 1;
            this.valueActiveIndex.set(prev < 0 ? options.length - 1 : prev);
        } else if (event.key === 'Enter' && this.valueActiveIndex() >= 0) {
            event.preventDefault();
            this.selectValue(options[this.valueActiveIndex()]);
        } else if (event.key === 'Escape') {
            this.valueOpen.set(false);
            this.valueActiveIndex.set(-1);
        }
    }

    closeAttribute(): void {
        this.attributeOpen.set(false);
        this.attributeActiveIndex.set(-1);
    }

    clearAttribute(): void {
        this.attributeSearch.set('');
        this.attributeOpen.set(false);
        this.attributeActiveIndex.set(-1);
        this.valueSearch.set('');
        this.valueOpen.set(false);
        this.valueActiveIndex.set(-1);
        this.values.set([]);
        this.value.set({
            attribute_id: null,
            attribute_title: '',
            value_id: null,
            value: '',
        });
    }

    clearValue(): void {
        this.valueSearch.set('');
        this.valueOpen.set(false);
        this.valueActiveIndex.set(-1);
        this.value.update((current) => ({
            ...current,
            value_id: null,
            value: '',
        }));
    }

    closeValue(): void {
        this.valueOpen.set(false);
        this.valueActiveIndex.set(-1);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as Node | null;
        if (target && this.elementRef.nativeElement.contains(target)) {
            return;
        }

        this.closeAttribute();
        this.closeValue();
    }
}
