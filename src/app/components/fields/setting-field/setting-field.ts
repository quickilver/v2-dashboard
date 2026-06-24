import { Component, computed, Input, input, model } from '@angular/core';
import { InputFieldComponent } from '../input-field/input-field';
import { CheckboxFieldComponent } from '../checkbox-field/checkbox-field';

@Component({
    selector: 'app-setting-field',
    standalone: true,
    imports: [InputFieldComponent, CheckboxFieldComponent],
    templateUrl: './setting-field.html',
})
export class SettingFieldComponent {
    title = input<string>('');
    type = input<'text' | 'checkbox'>('text');
    value = model<string | number | boolean>('');
    alias = input<string>('');
    options = input<any>(null);

    // Derived signal for text input compatibility (string | number only)
    textValue = computed<string | number>(() => {
        const v = this.value();
        return typeof v === 'boolean' ? '' : v;
    });

}
