import { Component, Input, input, InputSignal, model, ModelSignal } from '@angular/core';

@Component({
    selector: 'app-input-field',
    standalone: true,
    imports: [],
    templateUrl: './input-field.html',
    styleUrl: './input-field.scss',
})
export class InputFieldComponent {
    label: InputSignal<string> = input<string>('');
    placeholder: InputSignal<string> = input<string>('');
    type: InputSignal<string> = input<string>('text');
    readonly: InputSignal<boolean> = input<boolean>(false);
    value: ModelSignal<string | number> = model<string | number>('');

    handleInput(event: Event): void {
        const inputElement: HTMLInputElement = event.target as HTMLInputElement;
        this.value.set(inputElement.value);
    }
}
