import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    input,
    model,
    signal,
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CheckboxFieldComponent } from '../../../fields/checkbox-field/checkbox-field';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { AccountService } from '../../../../services/account.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { AccountModel } from '../../../../models/account.model';
import { PhoneHelper } from '../../../../helpers/phone.helper';

@Component({
    selector: 'app-accounts-editor',
    standalone: true,
    imports: [InputFieldComponent, CheckboxFieldComponent, SkeletonComponent],
    templateUrl: './accounts-editor.html',
    styleUrl: './accounts-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsEditorComponent implements OnInit {
    private readonly accountService = inject(AccountService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    firstName = model<string>('');
    lastName = model<string>('');
    middleName = model<string>('');
    phone = model<string>('');
    email = model<string>('');
    password = model<string>('');
    isBlocked = model<boolean>(false);

    orders = signal<unknown[]>([]);

    ordersCount = computed<number>(() => this.orders().length);

    ngOnInit(): void {
        const accountId = this.id();

        if (accountId) {
            this.isEditMode.set(true);
            this.loadAccount(accountId);
        }
    }

    private async loadAccount(id: number): Promise<void> {
        this.loading.set(true);

        try {
            const response = await this.accountService.show(id);
            const account: AccountModel = response.data;

            this.firstName.set(account.first_name);
            this.lastName.set(account.last_name ?? '');
            this.middleName.set(account.middle_name ?? '');
            this.phone.set(PhoneHelper.format(account.phone ?? ''));
            this.email.set(account.email ?? '');
            this.isBlocked.set(account.is_blocked);
        } catch {
            this.notificationService.error('Не удалось загрузить данные клиента');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data = {
                first_name: this.firstName().trim(),
                last_name: this.lastName().trim() || null,
                middle_name: this.middleName().trim() || null,
                phone: PhoneHelper.toNumber(this.phone()),
                email: this.email().trim() || null,
                is_blocked: this.isBlocked(),
            };

            if (this.isEditMode()) {
                const payload: Partial<AccountModel> & { password?: string } = { ...data };

                if (this.password().trim()) {
                    payload.password = this.password().trim();
                }

                await this.accountService.update(this.id()!, payload);
            } else {
                await this.accountService.create({
                    ...data,
                    password: this.password().trim(),
                });
            }

            this.notificationService.success('Клиент успешно сохранён');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response?.error?.message ?? 'Ошибка при сохранении клиента',
            );
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }

    isActiveTab(tab: string): boolean {
        return this.tab() === tab;
    }

    changeTab(tab: string): void {
        this.tab.set(tab);
    }
}
