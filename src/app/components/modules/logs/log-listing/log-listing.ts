import {
    Component,
    signal,
    computed,
    ChangeDetectionStrategy,
    OnInit,
    inject,
} from '@angular/core';
import { SelectFieldComponent } from '../../../fields/select-field/select-field';
import type { SelectOption } from '../../../../models/fields/select-option.model';
import { AutocompleteUsersFieldComponent } from '../../../fields/autocomplete-users-field/autocomplete-users-field';
import { UserShort } from '../../../../models/users/user-short.model';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { LogService } from '../../../../services/log.service';
import { LogModel } from '../../../../models/log.model';
import { LogsIndexResponse } from '../../../../models/responses/logs/logs-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LogDetailsComponent } from '../log-details/log-details';
import { UsersEditorComponent } from '../../users/users-editor/users-editor';
import { LogIndexParams } from '../../../../models/params/log-index.params';
import { LogRow } from './log-row.model';

@Component({
    selector: 'app-log-listing',
    standalone: true,
    imports: [ListingComponent, SelectFieldComponent, AutocompleteUsersFieldComponent],
    templateUrl: './log-listing.html',
    styles: '.log-filters { display: flex; flex-wrap: wrap; gap: 8px; }',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogListingComponent implements OnInit {
    private readonly logService = inject(LogService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px', isDefault: true },
        { key: 'event', title: 'Событие', sortable: true, isDefault: true },
        { key: 'model_type', title: 'Сущность', sortable: true, isDefault: true },
        { key: 'model_id', title: 'ID', sortable: true, width: '100px', isDefault: true },
        { key: 'user', title: 'Пользователь', type: 'link', isDefault: true },
        { key: 'created_at', title: 'Дата', sortable: true, isDefault: true },
    ]);

    columnsStorageKey = 'logs';

    logs = signal<LogModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    rows = computed<LogRow[]>(() => this.logs().map((log) => this.toRow(log)));

    event = signal<NonNullable<LogIndexParams['event']> | null>(null);
    user = signal<UserShort | null>(null);
    readonly eventOptions: SelectOption[] = [
        { label: 'Создание', value: 'created' },
        { label: 'Изменение', value: 'updated' },
        { label: 'Удаление', value: 'deleted' },
        { label: 'Восстановление', value: 'restored' },
    ];

    private search: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadLogs();
    }

    async loadLogs(): Promise<void> {
        this.loading.set(true);
        try {
            const params: LogIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.search,
                event: this.event() ?? undefined,
                user_id: this.user()?.id,
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: LogsIndexResponse = await this.logService.index(params);
            this.logs.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке логов');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(row: LogRow): void {
        const log = this.logs().find((item) => item.id === row.id);
        if (log) {
            this.onDetails(log);
        }
    }

    onCellClick(event: { row: LogRow; column: ListingColumn }): void {
        switch (event.column.key) {
            case 'user':
                this.popupService.open(
                    'Редактирование пользователя',
                    UsersEditorComponent,
                    { id: event.row.user_id },
                    'with-tabs',
                );
                break;
        }
    }

    onDetails(log: LogModel): void {
        this.popupService.open('Просмотр лога', LogDetailsComponent, { id: log.id }, 'with-tabs');
    }

    onSearch(query: string): void {
        this.search = query;
        this.page.set(1);
        this.loadLogs();
    }

    onEventChange(value: string | number | null): void {
        this.event.set(value as LogIndexParams['event'] ?? null);
        this.page.set(1);
        this.loadLogs();
    }

    onUserChange(user: UserShort | null): void {
        this.user.set(user);
        this.page.set(1);
        this.loadLogs();
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadLogs();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadLogs();
    }

    onPageSizeChange(pageSize: number): void {
        this.pageSize.set(pageSize);
        this.page.set(1);
        this.loadLogs();
    }

    private toRow(log: LogModel): LogRow {
        return {
            id: log.id,
            event: log.event,
            model_type: log.model_type,
            model_id: log.model_id,
            user_id: log.user_id,
            user: log.user?.name ?? 'ID: ' + log.user_id,
            created_at: new Date(log.created_at).toLocaleString('ru-RU'),
        };
    }
}
