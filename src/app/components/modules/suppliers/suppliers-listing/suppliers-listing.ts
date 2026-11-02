import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { SupplierService } from '../../../../services/supplier.service';
import { SupplierModel } from '../../../../models/supplier.model';
import { SuppliersIndexResponse } from '../../../../models/responses/suppliers/suppliers-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { SupplierIndexParams } from '../../../../models/params/supplier-index.params';
import { SuppliersEditorComponent } from '../suppliers-editor/suppliers-editor';

@Component({
    selector: 'app-suppliers-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './suppliers-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersListingComponent implements OnInit {
    private readonly supplierService = inject(SupplierService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'title', title: 'Название', sortable: true },
        { key: 'description', title: 'Описание', sortable: false },
    ]);

    suppliers = signal<SupplierModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadSuppliers();
    }

    async loadSuppliers(): Promise<void> {
        this.loading.set(true);
        try {
            const params: SupplierIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.currentSearch,
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: SuppliersIndexResponse = await this.supplierService.index(params);
            this.suppliers.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке контрагентов');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(supplier: SupplierModel): void {
        this.onEdit(supplier);
    }

    onEdit(supplier: SupplierModel): void {
        this.popupService
            .open('Редактирование контрагента', SuppliersEditorComponent, { id: supplier.id })
            .then(() => {
                this.loadSuppliers();
            });
    }

    async onDelete(supplier: SupplierModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление контрагента',
            `Вы уверены, что хотите удалить контрагента "${supplier.title}"?`,
            'Удалить',
            'Отмена',
        );

        if (confirmed) {
            try {
                await this.supplierService.delete(supplier.id);
                this.notificationService.success('Контрагент успешно удалён');
                this.loadSuppliers();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении контрагента');
            }
        }
    }

    createClick(): void {
        this.popupService.open('Создание контрагента', SuppliersEditorComponent).then(() => {
            this.loadSuppliers();
        });
    }

    onSearch(query: string): void {
        this.currentSearch = query;
        this.page.set(1);
        this.loadSuppliers();
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadSuppliers();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadSuppliers();
    }
}
