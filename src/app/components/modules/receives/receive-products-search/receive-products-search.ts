import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AutocompleteProductsFieldComponent } from '../../../fields/autocomplete-products-field/autocomplete-products-field';
import { PopupProductFieldComponent } from '../../../fields/popup-product-field/popup-product-field';
import { PopupService } from '../../../../services/popup.service';
import { ProductIndex } from '../../../../models/products/product-short.model';

@Component({
    selector: 'app-receive-products-search',
    standalone: true,
    imports: [AutocompleteProductsFieldComponent],
    templateUrl: './receive-products-search.html',
    styleUrl: './receive-products-search.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiveProductsSearchComponent {
    private readonly popupService = inject(PopupService);

    placeholder = input<string>('Поиск по названию или артикулу');
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
