import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface SelectOption {
    label: string;
    value: string | number;
}

@Component({
    selector: 'app-select-field',
    standalone: true,
    imports: [],
    templateUrl: './select-field.html',
    styleUrl: './select-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectFieldComponent {
    label = input<string>('');
    placeholder = input<string>('Выберите значение');
    options = input<SelectOption[]>([]);
    disabled = input<boolean>(false);
    value = model<string | number | null>(null);

    handleChange(event: Event): void {
        const selectElement: HTMLSelectElement = event.target as HTMLSelectElement;
        const rawValue: string = selectElement.value;

        this.value.set(rawValue === '' ? null : this.toOptionValue(rawValue));
    }

    private toOptionValue(rawValue: string): string | number {
        const matchedOption: SelectOption | undefined = this.options().find(
            (option) => String(option.value) === rawValue,
        );

        return matchedOption ? matchedOption.value : rawValue;
    }
}
