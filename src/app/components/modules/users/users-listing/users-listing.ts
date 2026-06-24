import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { UserService } from '../../../../services/user.service';
import { UserIndexParams } from '../../../../models/params/user-index.params';
import { UserShort } from '../../../../models/users/user-short.model';
import { UsersIndexResponse } from '../../../../models/responses/users/users-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { UsersEditorComponent } from '../users-editor/users-editor';
@Component({
    selector: 'app-users-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './users-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListingComponent implements OnInit {
    private readonly popupService = inject(PopupService);
    private readonly userService = inject(UserService);
    private readonly confirmService = inject(ConfirmService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '100px' },
        { key: 'name', title: 'Имя', sortable: true },
        { key: 'email', title: 'Email', sortable: true }
    ]);

    users = signal<UserShort[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadUsers();
    }

    async loadUsers(): Promise<void> {
        this.loading.set(true);
        try {
            const params: UserIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.currentSearch,
                sort: this.currentSort,
                direction: this.currentDirection
            };

            const response: UsersIndexResponse = await this.userService.index(params);
            this.users.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(user: UserShort): void {
        this.onEdit(user);
    }

    onEdit(user: UserShort): void {
        this.popupService
            .open('Редактирование магазина', UsersEditorComponent, { id: user.id })
            .then(() => {
                this.loadUsers();
            });
    }

    async onDelete(user: UserShort): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление менеджера',
            `Вы уверены, что хотите удалить менеджера "${user.name}"?`,
            'Удалить',
            'Отмена'
        );

        if (confirmed) {
            console.log('Delete user:', user);
        }
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadUsers();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadUsers();
    }
}
