import {
    Component,
    computed,
    input,
    model,
    output,
    ChangeDetectionStrategy,
    signal,
} from '@angular/core';

export interface AutocompleteOption {
    label: string;
    value: unknown;
}

@Component({
    selector: 'app-autocomplete-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-field.html',
    styleUrl: './autocomplete-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteFieldComponent {
    label = input<string>('');
    placeholder = input<string>('');
    options = input<AutocompleteOption[]>([]);

    search = model<string>('');
    selectedOption = output<AutocompleteOption>();

    isOpen = signal<boolean>(false);
    activeIndex = signal<number>(-1);

    filteredOptions = computed(() => {
        const query = this.search().toLowerCase().trim();
        if (!query) return [];

        return this.options().filter((option) =>
            option.label.toLowerCase().includes(query),
        );
    });

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.search.set(value);
        this.isOpen.set(value.length > 0);
        this.activeIndex.set(-1);
    }

    selectOption(option: AutocompleteOption): void {
        this.search.set(option.label);
        this.isOpen.set(false);
        this.activeIndex.set(-1);
        this.selectedOption.emit(option);
    }

    onKeydown(event: KeyboardEvent): void {
        const options = this.filteredOptions();

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
            this.selectOption(options[this.activeIndex()]);
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