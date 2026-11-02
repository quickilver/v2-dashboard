import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { MetaModel } from '../../../../models/meta.model';
import { ReceiveModel } from '../../../../models/receive.model';
import { ReceiveIndexParams } from '../../../../models/params/receive-index.params';
import { ReceivesIndexResponse } from '../../../../models/responses/receives/receives-index.response';
import { ReceiveService } from '../../../../services/receive.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { ReceivesEditorComponent } from '../receives-editor/receives-editor';
import { SuppliersEditorComponent } from '../../suppliers/suppliers-editor/suppliers-editor';
import { UsersEditorComponent } from '../../users/users-editor/users-editor';
import { ReceiveRow } from './receive-row.model';

@Component({
    selector: 'app-receives-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './receives-listing.html',
    styleUrl: './receives-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivesListingComponent implements OnInit {
    private readonly receiveService = inject(ReceiveService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'store', title: 'Склад', sortable: false },
        {
            key: 'supplier',
            title: 'Контрагент',
            sortable: false,
            type: 'link',
            formatter: (row: ReceiveRow) => row.supplier?.title ?? '—',
        },
        {
            key: 'user',
            title: 'Менеджер',
            sortable: false,
            type: 'link',
            formatter: (row: ReceiveRow) => row.user?.name ?? '—',
        },
        { key: 'total_count', title: 'Кол-во', sortable: false, width: '100px' },
        { key: 'total_price', title: 'Сумма', sortable: false, width: '140px' },
        { key: 'created_at', title: 'Дата', sortable: true, width: '170px' },
    ]);

    receives = signal<ReceiveModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    rows = computed<ReceiveRow[]>(() => this.receives().map((receive) => this.toRow(receive)));

    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadReceives();
    }

    async loadReceives(): Promise<void> {
        this.loading.set(true);
        try {
            const params: ReceiveIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: ReceivesIndexResponse = await this.receiveService.index(params);
            this.receives.set(response.data);
            this.meta.set(response.meta);
        } catch {
            this.notificationService.error('Ошибка при загрузке поступлений');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(row: ReceiveRow): void {
        this.openEditor(row.id);
    }

    onEdit(row: ReceiveRow): void {
        this.openEditor(row.id);
    }

    onCellClick(event: { row: ReceiveRow; column: ListingColumn }): void {
        switch (event.column.key) {
            case 'supplier':
                if (event.row.supplier) {
                    this.popupService.open('Редактирование контрагента', SuppliersEditorComponent, {
                        id: event.row.supplier.id,
                    });
                }
                break;
            case 'user':
                if (event.row.user) {
                    this.popupService.open(
                        'Редактирование пользователя',
                        UsersEditorComponent,
                        { id: event.row.user.id },
                        'with-tabs',
                    );
                }
                break;
        }
    }

    async onDelete(row: ReceiveRow): Promise<void> {
        const confirmed: boolean = await this.confirmService.confirm(
            'Удаление поступления',
            `Вы уверены, что хотите удалить поступление №${row.id}?`,
            'Удалить',
            'Отмена',
        );

        if (!confirmed) {
            return;
        }

        try {
            await this.receiveService.delete(row.id);
            this.notificationService.success('Поступление успешно удалено');
            this.loadReceives();
        } catch {
            this.notificationService.error('Ошибка при удалении поступления');
        }
    }

    createClick(): void {
        this.popupService
            .open('Создание поступления', ReceivesEditorComponent, {}, 'with-tabs')
            .then(() => this.loadReceives());
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadReceives();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadReceives();
    }

    private openEditor(id: number): void {
        this.popupService
            .open('Редактирование поступления', ReceivesEditorComponent, { id }, 'with-tabs')
            .then(() => this.loadReceives());
    }

    private toRow(receive: ReceiveModel): ReceiveRow {
        return {
            id: receive.id,
            store: receive.store?.title ?? '—',
            supplier: receive.supplier,
            user: receive.user,
            total_count: receive.total_count,
            total_price: this.formatAmount(receive.total_price),
            created_at: new Date(receive.created_at).toLocaleString('ru-RU'),
        };
    }

    private formatAmount(amount: number): string {
        return amount.toLocaleString('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
}
