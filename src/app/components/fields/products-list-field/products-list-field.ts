import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AutocompleteProductsFieldComponent } from '../autocomplete-products-field/autocomplete-products-field';
import { PopupProductFieldComponent } from '../popup-product-field/popup-product-field';
import { PopupService } from '../../../services/popup.service';
import { ProductIndex } from '../../../models/products/product-short.model';

@Component({
    selector: 'app-products-list-field',
    standalone: true,
    imports: [AutocompleteProductsFieldComponent],
    templateUrl: './products-list-field.html',
    styleUrl: './products-list-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListFieldComponent {
    private readonly popupService = inject(PopupService);

    placeholder = input<string>('Поиск по названию или артикулу');
    searchLabel = input<string>('Добавьте товар через поиск');
    catalogLabel = input<string>('или выберите товар из каталога');

    productSelected = output<ProductIndex>();

    onValueChange(product: ProductIndex | null): void {
        if (product) {
            this.productSelected.emit(product);
        }
    }

    async openCatalog(): Promise<void> {
        const products = await this.popupService.open<ProductIndex[]>(
            'Выбор товаров',
            PopupProductFieldComponent,
            { multiple: true },
        );

        products?.forEach((product) => this.productSelected.emit(product));
    }
}
