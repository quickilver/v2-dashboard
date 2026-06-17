import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { DropdownOption } from '../../../models/dropdown.model';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-dropdown-field',
    standalone: true,
    imports: [
        IconComponent
    ],
    templateUrl: './dropdown-field.html',
    styleUrl: './dropdown-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownFieldComponent {
    label = input<string>('');
    options = input<DropdownOption[]>([]);

    isOpen = signal<boolean>(false);

    toggle(): void {
        this.isOpen.update(value => !value);
    }

    selectOption(option: DropdownOption): void {
        this.isOpen.set(false);
        option.action();
    }

    close(): void {
        this.isOpen.set(false);
    }
}
