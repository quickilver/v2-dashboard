import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { PriceService } from '../../../../services/price.service';
import { PriceModel } from '../../../../models/price.model';
import { PricesIndexResponse } from '../../../../models/responses/prices/prices-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { PricesEditorComponent } from '../prices-editor/prices-editor';
import { PriceIndexParams } from '../../../../models/params/price-index.params';

@Component({
    selector: 'app-prices-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './prices-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricesListingComponent implements OnInit {
    private readonly priceService = inject(PriceService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'title', title: 'Название', sortable: true },
        { key: 'currency', title: 'Валюта', sortable: true },
    ]);

    prices = signal<PriceModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadPrices();
    }

    async loadPrices(): Promise<void> {
        this.loading.set(true);
        try {
            const params: PriceIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: PricesIndexResponse = await this.priceService.index(params);
            this.prices.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке цен');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(price: PriceModel): void {
        this.onEdit(price);
    }

    onEdit(price: PriceModel): void {
        this.popupService
            .open('Редактирование цены', PricesEditorComponent, { id: price.id })
            .then(() => {
                this.loadPrices();
            });
    }

    async onDelete(price: PriceModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление цены',
            `Вы уверены, что хотите удалить цену "${price.title}"?`,
            'Удалить',
            'Отмена',
        );

        if (confirmed) {
            try {
                await this.priceService.delete(price.id);
                this.notificationService.success('Цена успешно удалена');
                this.loadPrices();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении цены');
            }
        }
    }

    createClick(): void {
        this.popupService.open('Создание цены', PricesEditorComponent).then(() => {
            this.loadPrices();
        });
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadPrices();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadPrices();
    }
}
