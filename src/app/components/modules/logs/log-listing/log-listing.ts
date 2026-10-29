import { Component, signal, computed, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
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
import { LogEventLabel, formatModelType } from '../log-details/log-helpers';
import { LogRow } from './log-row.model';

@Component({
    selector: 'app-log-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './log-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogListingComponent implements OnInit {
    private readonly logService = inject(LogService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'event', title: 'Событие', sortable: true },
        { key: 'model_type', title: 'Сущность', sortable: true },
        { key: 'model_id', title: 'ID', sortable: true, width: '100px' },
        { key: 'user', title: 'Пользователь', type: 'link' },
        { key: 'created_at', title: 'Дата', sortable: true },
    ]);

    logs = signal<LogModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    rows = computed<LogRow[]>(() => this.logs().map((log) => this.toRow(log)));

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
                );
                break;
        }
    }

    onDetails(log: LogModel): void {
        this.popupService.open('Просмотр лога', LogDetailsComponent, { id: log.id });
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

    private toRow(log: LogModel): LogRow {
        return {
            id: log.id,
            event: LogEventLabel[log.event] ?? log.event,
            model_type: formatModelType(log.model_type),
            model_id: log.model_id,
            user_id: log.user_id,
            user: log.user?.name
                ? log.user?.name
                : 'ID: ' + log.user_id,
            created_at: new Date(log.created_at).toLocaleString('ru-RU'),
        };
    }
}
