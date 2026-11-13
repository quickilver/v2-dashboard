import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { CalendarFieldComponent } from '../../../fields/calendar-field/calendar-field';
import { AutocompleteUsersFieldComponent } from '../../../fields/autocomplete-users-field/autocomplete-users-field';
import { AutocompleteAccountsFieldComponent } from '../../../fields/autocomplete-accounts-field/autocomplete-accounts-field';
import { AccountModel } from '../../../../models/account.model';
import { UserShort } from '../../../../models/users/user-short.model';
import { OrderReportFilters } from '../../../../models/reports/order-report-filters.model';

@Component({
    selector: 'app-order-reports-filters',
    standalone: true,
    imports: [
        CalendarFieldComponent,
        AutocompleteUsersFieldComponent,
        AutocompleteAccountsFieldComponent,
    ],
    templateUrl: './order-reports-filters.html',
    styleUrl: './order-reports-filters.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderReportsFiltersComponent {
    filters = model<OrderReportFilters>({
        date_from: '',
        date_to: '',
        manager_id: null,
        account_id: null,
    });

    readonly managerSearch = signal<string>('');
    readonly selectedManager = model<UserShort | null>(null);
    readonly accountSearch = signal<string>('');
    readonly selectedAccount = model<AccountModel | null>(null);

    onDateFromChange(value: string): void {
        this.filters.update((filters) => ({ ...filters, date_from: value }));
    }

    onDateToChange(value: string): void {
        this.filters.update((filters) => ({ ...filters, date_to: value }));
    }

    onManagerChange(user: UserShort | null): void {
        this.filters.update((filters) => ({ ...filters, manager_id: user?.id ?? null }));
    }

    onAccountChange(account: AccountModel | null): void {
        this.filters.update((filters) => ({ ...filters, account_id: account?.id ?? null }));
    }
}
