import { Component, input, model } from '@angular/core';

@Component({
    selector: 'app-wyswig-field',
    standalone: true,
    imports: [],
    templateUrl: './wyswig-field.html',
    styleUrl: './wyswig-field.scss',
})
export class WyswigFieldComponent {
    label = input<string>('');
    value = model<string>('');
    placeholder = input<string>('');

    executeCommand(command: string): void {
        document.execCommand(command, false);
    }

    changeFontSize(size: string): void {
        document.execCommand('fontSize', false, size);
    }
}
