import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { ProductAttribute } from '../../../../models/products/product-attribute.model';
import {
    AutocompleteAttributesFieldComponent,
    AttributeFieldValue,
} from '../../../fields/autocomplete-attributes-field/autocomplete-attributes-field';

@Component({
    selector: 'app-products-editor-attributes',
    standalone: true,
    imports: [AutocompleteAttributesFieldComponent],
    templateUrl: './products-editor-attributes.html',
    styleUrl: './products-editor-attributes.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsEditorAttributesComponent {
    attributes = model<ProductAttribute[]>([]);

    newAttribute = signal<AttributeFieldValue>({
        attribute_id: null,
        attribute_title: '',
        value_id: null,
        value: '',
    });

    addAttribute(): void {
        const attribute = this.newAttribute();
        const title = attribute.attribute_title.trim();
        const value = attribute.value.trim();
        if (!title || !value) return;

        this.attributes.update((items) => [
            ...items,
            {
                id: attribute.attribute_id ?? 0,
                title,
                value,
                value_id: attribute.value_id ?? 0,
                position: items.length + 1,
            },
        ]);

        this.newAttribute.set({
            attribute_id: null,
            attribute_title: '',
            value_id: null,
            value: '',
        });
    }

    removeAttribute(index: number): void {
        this.attributes.update((items) => items.filter((_, i) => i !== index));
    }

    /** Защита от повторного коммита: Enter уже переставил, blur не должен коммитить дважды. */
    private suppressPositionBlur = false;

    onPositionEnter(index: number, event: Event): void {
        this.suppressPositionBlur = true;
        this.commitPosition(index, event);
        (event.target as HTMLInputElement).blur();
    }

    onPositionBlur(index: number, event: Event): void {
        if (this.suppressPositionBlur) {
            this.suppressPositionBlur = false;
            return;
        }
        this.commitPosition(index, event);
    }

    private commitPosition(index: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        const position = Math.round(Number(input.value));

        this.attributes.update((items) => {
            const clamped = Number.isFinite(position)
                ? Math.min(Math.max(position, 1), items.length)
                : index + 1;

            if (clamped === index + 1) {
                return items.map((item, i) => ({ ...item, position: i + 1 }));
            }

            const reordered = [...items];
            const [moved] = reordered.splice(index, 1);
            reordered.splice(clamped - 1, 0, moved);
            return reordered.map((item, i) => ({ ...item, position: i + 1 }));
        });
    }
}
