import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
    selector: 'app-textarea-field',
    standalone: true,
    imports: [],
    templateUrl: './textarea-field.html',
    styleUrl: './textarea-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaFieldComponent {
    label = input<string>('');
    placeholder = input<string>('');
    rows = input<number>(4);
    readonly = input<boolean>(false);
    value = model<string>('');

    handleInput(event: Event): void {
        const textareaElement: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
        this.value.set(textareaElement.value);
    }
}
