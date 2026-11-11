import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { IconComponent } from '../../../icon/icon';
import { CalendarFieldComponent } from '../../../fields/calendar-field/calendar-field';
import { AutocompleteProductsFieldComponent } from '../../../fields/autocomplete-products-field/autocomplete-products-field';
import { AutocompleteAccountsFieldComponent } from '../../../fields/autocomplete-accounts-field/autocomplete-accounts-field';
import { OrderFilters } from '../../../../models/orders/order-filters.model';
import { ProductIndex } from '../../../../models/products/product-short.model';
import { AccountModel } from '../../../../models/account.model';

@Component({
    selector: 'app-orders-filters',
    standalone: true,
    imports: [
        InputFieldComponent,
        IconComponent,
        CalendarFieldComponent,
        AutocompleteProductsFieldComponent,
        AutocompleteAccountsFieldComponent,
    ],
    templateUrl: './orders-filters.html',
    styleUrl: './orders-filters.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersFiltersComponent {
    filters = model<OrderFilters>({
        query: '',
        account_id: null,
        product_id: null,
        date_from: '',
        date_to: '',
    });

    expandedGroups = signal<Record<string, boolean>>({
        account: false,
        product: false,
        date: false,
    });

    accountSearch = signal<string>('');
    selectedAccount = signal<AccountModel | null>(null);

    productSearch = signal<string>('');
    selectedProduct = signal<ProductIndex | null>(null);

    accountCount = computed<number>(() => (this.filters().account_id ? 1 : 0));
    productCount = computed<number>(() => (this.filters().product_id ? 1 : 0));
    dateCount = computed<number>(() => {
        const filters = this.filters();
        return (filters.date_from ? 1 : 0) + (filters.date_to ? 1 : 0);
    });

    isExpanded(group: string): boolean {
        return this.expandedGroups()[group] ?? false;
    }

    toggleGroup(group: string): void {
        this.expandedGroups.update((groups) => ({
            ...groups,
            [group]: !groups[group],
        }));
    }

    onQueryChange(value: string | number): void {
        this.filters.update((filters) => ({ ...filters, query: String(value) }));
    }

    onAccountChange(account: AccountModel | null): void {
        this.selectedAccount.set(account);
        this.filters.update((filters) => ({ ...filters, account_id: account?.id ?? null }));
    }

    onProductChange(product: ProductIndex | null): void {
        this.selectedProduct.set(product);
        this.filters.update((filters) => ({ ...filters, product_id: product?.id ?? null }));
    }

    onDateFromChange(value: string): void {
        this.filters.update((filters) => ({ ...filters, date_from: value }));
    }

    onDateToChange(value: string): void {
        this.filters.update((filters) => ({ ...filters, date_to: value }));
    }
}
