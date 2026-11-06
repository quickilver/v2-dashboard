import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { AccountService } from '../../../../services/account.service';
import { AccountModel } from '../../../../models/account.model';
import { AccountsIndexResponse } from '../../../../models/responses/accounts/accounts-index.response';
import { AccountIndexParams } from '../../../../models/params/account-index.params';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { AccountsEditorComponent } from '../accounts-editor/accounts-editor';

@Component({
    selector: 'app-accounts-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './accounts-listing.html',
    styleUrl: './accounts-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsListingComponent implements OnInit {
    private readonly accountService = inject(AccountService);
    private readonly confirmService = inject(ConfirmService);
    private readonly notificationService = inject(NotificationService);
    private readonly popupService = inject(PopupService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '80px', isDefault: true },
        { key: 'last_name', title: 'Фамилия', sortable: false, isDefault: true },
        { key: 'first_name', title: 'Имя', sortable: false, isDefault: true },
        { key: 'phone', title: 'Телефон', sortable: true, isDefault: true },
        { key: 'email', title: 'Email', sortable: true, isDefault: true },
        {
            key: 'is_blocked',
            title: 'Статус',
            type: 'boolean',
            labels: { true: 'Заблокирован', false: 'Активен' },
            width: '140px',
            isDefault: true,
        },
        { key: 'guid', title: 'GUID', sortable: false },
        { key: 'created_at', title: 'Дата создания', sortable: true, width: '180px' },
    ]);

    columnsStorageKey = 'accounts';

    accounts = signal<AccountModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private search: string = '';
    private sort: string = '';
    private direction: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadAccounts();
    }

    async loadAccounts(): Promise<void> {
        this.loading.set(true);

        try {
            const params: AccountIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.search,
                sort: this.sort,
                direction: this.direction,
            };

            const response: AccountsIndexResponse = await this.accountService.index(params);
            this.accounts.set(response.data);
            this.meta.set(response.meta);
        } catch {
            this.notificationService.error('Ошибка при загрузке клиентов');
        } finally {
            this.loading.set(false);
        }
    }

    onSearch(query: string): void {
        this.search = query;
        this.page.set(1);
        this.loadAccounts();
    }

    onRowClick(account: AccountModel): void {
        this.onEdit(account);
    }

    onEdit(account: AccountModel): void {
        this.popupService
            .open(
                'Редактирование клиента',
                AccountsEditorComponent,
                { id: account.id },
                'with-tabs',
            )
            .then(() => this.loadAccounts());
    }

    createClick(): void {
        this.popupService
            .open('Создание клиента', AccountsEditorComponent, {}, 'with-tabs')
            .then(() => this.loadAccounts());
    }

    async onDelete(account: AccountModel): Promise<void> {
        const confirmed: boolean = await this.confirmService.confirm(
            'Удаление клиента',
            `Вы уверены, что хотите удалить клиента "${this.fullName(account)}"?`,
            'Удалить',
            'Отмена',
        );

        if (!confirmed) {
            return;
        }

        try {
            await this.accountService.delete(account.id);
            this.notificationService.success('Клиент удалён');
            this.loadAccounts();
        } catch {
            this.notificationService.error('Ошибка при удалении клиента');
        }
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.sort = sort.key;
        this.direction = sort.direction;
        this.page.set(1);
        this.loadAccounts();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadAccounts();
    }

    private fullName(account: AccountModel): string {
        return [account.last_name, account.first_name, account.middle_name]
            .filter((part) => !!part)
            .join(' ');
    }
}
