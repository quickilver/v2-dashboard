import { ChangeDetectionStrategy, Component, Signal, computed, inject, model } from '@angular/core';
import { AutocompleteBaseComponent } from '../autocomplete-field/autocomplete-field';
import { AccountService } from '../../../services/account.service';
import { AccountModel } from '../../../models/account.model';

@Component({
    selector: 'app-autocomplete-accounts-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-accounts-field.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteAccountsFieldComponent extends AutocompleteBaseComponent<AccountModel> {
    private readonly accountService = inject(AccountService);

    value = model<AccountModel | null>(null);

    readonly filteredItems: Signal<AccountModel[]> = computed<AccountModel[]>(() => {
        const query: string = this.search().toLowerCase().trim();

        if (!query) {
            return [];
        }

        return this.items().filter((account) =>
            this.displayName(account).toLowerCase().includes(query),
        );
    });

    override readonly selectedLabel: Signal<string> = computed<string>(() => {
        const account = this.value();

        return account ? this.displayName(account) : '';
    });

    displayName(account: AccountModel): string {
        return [account.last_name, account.first_name, account.middle_name]
            .filter((part) => !!part)
            .join(' ');
    }

    selectItem(account: AccountModel): void {
        this.value.set(account);
        this.search.set('');
        this.items.set([]);
        this.close();
    }

    override clearSelection(): void {
        this.value.set(null);
        super.clearSelection();
    }

    protected async fetchItems(query: string): Promise<AccountModel[]> {
        const response = await this.accountService.index({ query, per_page: 10 });

        return response.data;
    }
}
