import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { AutocompleteAccountsFieldComponent } from '../../../fields/autocomplete-accounts-field/autocomplete-accounts-field';
import { AccountModel } from '../../../../models/account.model';
import { PhoneHelper } from '../../../../helpers/phone.helper';

@Component({
    selector: 'app-orders-account-tab',
    standalone: true,
    imports: [InputFieldComponent, AutocompleteAccountsFieldComponent],
    templateUrl: './orders-account-tab.html',
    styleUrl: './orders-account-tab.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersAccountTabComponent {
    accountSearch = model<string>('');
    selectedAccount = model<AccountModel | null>(null);

    contactPhone = model<string>('');
    contactEmail = model<string>('');
    contactFirstName = model<string>('');
    contactLastName = model<string>('');
    contactMiddleName = model<string>('');

    onAccountChange(account: AccountModel | null): void {
        if (!account) {
            return;
        }

        if (!this.contactLastName().trim()) {
            this.contactLastName.set(account.last_name ?? '');
        }

        if (!this.contactFirstName().trim()) {
            this.contactFirstName.set(account.first_name ?? '');
        }

        if (!this.contactMiddleName().trim()) {
            this.contactMiddleName.set(account.middle_name ?? '');
        }

        if (!this.contactPhone().trim() && account.phone) {
            this.contactPhone.set(PhoneHelper.format(account.phone));
        }

        if (!this.contactEmail().trim() && account.email) {
            this.contactEmail.set(account.email);
        }
    }
}
