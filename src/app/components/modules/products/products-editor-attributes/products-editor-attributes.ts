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
}
