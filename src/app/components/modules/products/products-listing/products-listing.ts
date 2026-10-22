import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { ProductService, ProductIndexParams } from '../../../../services/product.service';
import { ProductIndex } from '../../../../models/products/product-short.model';
import { ProductsIndexResponse } from '../../../../models/responses/products/products-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { ProductsEditorComponent } from '../products-editor/products-editor';

@Component({
    selector: 'app-products-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './products-listing.html',
    styleUrl: './products-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListingComponent implements OnInit {
    private readonly productService = inject(ProductService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '100px' },
        { key: 'title', title: 'Название', sortable: true },
        { key: 'sku', title: 'Артикул', sortable: true },
    ]);

    products = signal<ProductIndex[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void {
        this.loadProducts();
    }

    async loadProducts(): Promise<void> {
        this.loading.set(true);
        try {
            const params: ProductIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.currentSearch,
                sort: this.currentSort,
                direction: this.currentDirection,
            };

            const response: ProductsIndexResponse = await this.productService.index(params);
            this.products.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(product: ProductIndex): void {
        this.popupService
            .open('Редактирование товара', ProductsEditorComponent, { id: product.id })
            .then(() => {
                this.loadProducts();
            });
    }

    onEdit(product: ProductIndex): void {
        this.popupService
            .open('Редактирование товара', ProductsEditorComponent, { id: product.id })
            .then(() => {
                this.loadProducts();
            });
    }

    async onDelete(product: ProductIndex): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление товара',
            `Вы уверены, что хотите удалить товар "${product.title}"?`,
            'Удалить',
            'Отмена',
        );

        if (confirmed) {
            this.notificationService.info('Удаление товаров пока не реализовано');
        }
    }

    createClick(): void {
        this.popupService.open('Создание товара', ProductsEditorComponent).then(() => {
            this.loadProducts();
        });
    }

    onSearch(query: string): void {
        this.currentSearch = query;
        this.page.set(1);
        this.loadProducts();
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadProducts();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadProducts();
    }
}
