import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttributeValuesStoreModel } from '../../../../models/attributes/attribute-values-store.model';

@Component({
    selector: 'app-attribute-values-tab',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './attribute-values-tab.html',
    styleUrl: './attribute-values-tab.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeValuesTabComponent {
    values = model.required<AttributeValuesStoreModel[]>();
    newValue = model<string>('');

    addValue(): void {
        const value = this.newValue().trim();
        if (!value) return;

        this.values.update(vals => [...vals, { id: null, value }]);
        this.newValue.set('');
    }

    private updateValue(index: number, newVal: string): void {
        const trimmed: string = newVal.trim();
        if (!trimmed) return;

        this.values.update(vals =>
            vals.map((value, i) => i === index ? { ...value, value: trimmed } : value)
        );
    }

    deleteValue(index: number): void {
        this.values.update(vals => vals.filter((_, i) => i !== index));
    }

    onValueBlur(index: number, newVal: string): void {
        const trimmed = newVal.trim();
        const current = this.values()[index];
        if (trimmed && current && trimmed !== current.value) {
            this.updateValue(index, trimmed);
        }
    }
}