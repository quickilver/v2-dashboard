import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    model,
    OnDestroy,
    output,
    signal,
} from '@angular/core';
import { AttributeService } from '../../../services/attribute.service';
import { AttributeShortModel } from '../../../models/attributes/attribute-short.model';

@Component({
    selector: 'app-autocomplete-attributes-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-attributes-field.html',
    styleUrl: './autocomplete-attributes-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteAttributesFieldComponent implements OnDestroy {
    private readonly attributeService = inject(AttributeService);

    label = input<string>('');
    placeholder = input<string>('Поиск характеристики');
    excludeIds = input<number[]>([]);

    search = model<string>('');
    selected = output<AttributeShortModel>();

    isOpen = signal<boolean>(false);
    loading = signal<boolean>(false);
    activeIndex = signal<number>(-1);
    attributes = signal<AttributeShortModel[]>([]);

    private searchTimer: ReturnType<typeof setTimeout> | null = null;

    filteredAttributes = computed<AttributeShortModel[]>(() => {
        const excludedIds = this.excludeIds();
        return this.attributes().filter((attribute) => !excludedIds.includes(attribute.id));
    });

    ngOnDestroy(): void {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }
    }

    onInput(event: Event): void {
        const text = (event.target as HTMLInputElement).value;
        this.search.set(text);
        this.activeIndex.set(-1);

        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }

        if (text.trim().length === 0) {
            this.attributes.set([]);
            this.isOpen.set(false);
            return;
        }

        this.isOpen.set(true);
        this.searchTimer = setTimeout(() => {
            this.searchAttributes(text);
        }, 300);
    }

    private async searchAttributes(query: string): Promise<void> {
        this.loading.set(true);

        try {
            const response = await this.attributeService.index({ query, per_page: 10 });
            this.attributes.set(response.data);
        } catch {
            this.attributes.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    select(attribute: AttributeShortModel): void {
        this.selected.emit(attribute);
        this.search.set('');
        this.attributes.set([]);
        this.isOpen.set(false);
        this.activeIndex.set(-1);
    }

    onKeydown(event: KeyboardEvent): void {
        const options = this.filteredAttributes();

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
            this.select(options[this.activeIndex()]);
        } else if (event.key === 'Escape') {
            this.close();
        }
    }

    close(): void {
        this.isOpen.set(false);
        this.activeIndex.set(-1);
    }
}
