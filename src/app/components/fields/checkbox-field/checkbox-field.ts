import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
    selector: 'app-checkbox-field',
    standalone: true,
    imports: [],
    templateUrl: './checkbox-field.html',
    styleUrl: './checkbox-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFieldComponent {
    label = input<string>('');
    checked = model<boolean>(false);

    handleChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.checked.set(input.checked);
    }
}
