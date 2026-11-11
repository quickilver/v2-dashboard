import {
    Component,
    ElementRef,
    input,
    InputSignal,
    model,
    ModelSignal,
    viewChild,
} from '@angular/core';
import { MaskHelper } from '../../../helpers/mask.helper';

export type InputFieldSize = 'small' | 'regular' | 'big';

@Component({
    selector: 'app-input-field',
    standalone: true,
    imports: [],
    templateUrl: './input-field.html',
    styleUrl: './input-field.scss',
})
export class InputFieldComponent {
    private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputElement');

    label: InputSignal<string> = input<string>('');
    placeholder: InputSignal<string> = input<string>('');
    type: InputSignal<string> = input<string>('text');
    readonly: InputSignal<boolean> = input<boolean>(false);
    size: InputSignal<InputFieldSize> = input<InputFieldSize>('regular');
    mask: InputSignal<string> = input<string>('');
    value: ModelSignal<string | number> = model<string | number>('');

    handleInput(event: Event): void {
        const inputElement: HTMLInputElement = event.target as HTMLInputElement;
        const mask = this.mask();

        if (!mask) {
            this.value.set(inputElement.value);
            return;
        }

        const caret = inputElement.selectionStart ?? inputElement.value.length;
        const rawBeforeCaret = MaskHelper.extractValue(inputElement.value.slice(0, caret), mask);
        const rawValue = MaskHelper.extractValue(inputElement.value, mask);
        const maskedValue = MaskHelper.apply(rawValue, mask);

        this.value.set(maskedValue);

        const nextCaret = MaskHelper.caretPosition(maskedValue, mask, rawBeforeCaret.length);

        queueMicrotask(() => {
            const element = this.inputElement()?.nativeElement;

            if (element) {
                element.setSelectionRange(nextCaret, nextCaret);
            }
        });
    }
}
