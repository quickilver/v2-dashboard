import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { AccountModel } from '../../../models/account.model';

@Component({
    selector: 'app-autocomplete-accounts-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-accounts-field.html',
    styleUrl: './autocomplete-accounts-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteAccountsFieldComponent {
    private readonly accountService = inject(AccountService);

    label = input<string>('');
    placeholder = input<string>('');

    search = model<string>('');
    value = model<AccountModel | null>(null);

    isOpen = signal<boolean>(false);
    loading = signal<boolean>(false);
    activeIndex = signal<number>(-1);
    accounts = signal<AccountModel[]>([]);

    filteredAccounts = computed<AccountModel[]>(() => {
        const query: string = this.search().toLowerCase().trim();
        if (!query) return [];

        return this.accounts().filter((account) =>
            this.displayName(account).toLowerCase().includes(query),
        );
    });

    displayName(account: AccountModel): string {
        return [account.last_name, account.first_name, account.middle_name]
            .filter((part) => !!part)
            .join(' ');
    }

    async onInput(event: Event): Promise<void> {
        const query: string = (event.target as HTMLInputElement).value;
        this.search.set(query);
        this.activeIndex.set(-1);

        if (query.trim().length === 0) {
            this.isOpen.set(false);
            this.accounts.set([]);
            return;
        }

        this.loading.set(true);
        this.isOpen.set(true);

        try {
            const response = await this.accountService.index({ query, per_page: 10 });
            this.accounts.set(response.data);
        } catch {
            this.accounts.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    selectAccount(account: AccountModel): void {
        this.search.set(this.displayName(account));
        this.value.set(account);
        this.isOpen.set(false);
        this.activeIndex.set(-1);
    }

    onKeydown(event: KeyboardEvent): void {
        const options: AccountModel[] = this.filteredAccounts();

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextIndex: number = this.activeIndex() + 1;
            this.activeIndex.set(nextIndex >= options.length ? 0 : nextIndex);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const previousIndex: number = this.activeIndex() - 1;
            this.activeIndex.set(previousIndex < 0 ? options.length - 1 : previousIndex);
        } else if (event.key === 'Enter' && this.activeIndex() >= 0) {
            event.preventDefault();
            this.selectAccount(options[this.activeIndex()]);
        } else if (event.key === 'Escape') {
            this.isOpen.set(false);
            this.activeIndex.set(-1);
        }
    }

    close(): void {
        this.isOpen.set(false);
        this.activeIndex.set(-1);
    }
}
