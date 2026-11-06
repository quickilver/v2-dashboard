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
import { ProductsFiltersComponent } from '../products-filters/products-filters';
import { ProductFilters } from '../../../../models/products/product-filters.model';

@Component({
    selector: 'app-products-listing',
    standalone: true,
    imports: [ListingComponent, ProductsFiltersComponent],
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
        {
            key: 'picture',
            title: 'Фото',
            sortable: false,
            type: 'image',
            width: '80px',
            isDefault: true,
            imageUrl: (row: ProductIndex) => row.picture?.preview_url ?? row.picture?.url ?? '',
        },
        { key: 'id', title: 'ID', sortable: true, width: '100px', isDefault: true },
        { key: 'title', title: 'Название', sortable: true, isDefault: true },
        { key: 'sku', title: 'Артикул', sortable: true, isDefault: true },
        {
            key: 'total_count',
            title: 'Кол-во',
            sortable: false,
            width: '100px',
            isDefault: true,
            formatter: (row: ProductIndex) => String(row.total_count ?? 0),
        },
    ]);

    columnsStorageKey = 'products';

    products = signal<ProductIndex[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    filters = signal<ProductFilters>({
        query: '',
        categories: [],
        stores: [],
        prices: [],
        attributes: [],
    });

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
                categories: this.filters().categories,
                stores: this.filters().stores,
                prices: this.filters().prices,
                attributes: this.filters().attributes,
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
            .open('Редактирование товара', ProductsEditorComponent, { id: product.id }, 'with-tabs')
            .then(() => {
                this.loadProducts();
            });
    }

    onEdit(product: ProductIndex): void {
        this.popupService
            .open('Редактирование товара', ProductsEditorComponent, { id: product.id }, 'with-tabs')
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
        this.popupService
            .open('Создание товара', ProductsEditorComponent, {}, 'with-tabs')
            .then(() => {
                this.loadProducts();
            });
    }

    onSearch(query: string): void {
        this.currentSearch = query;
        this.page.set(1);
        this.loadProducts();
    }

    onFiltersChange(filters: ProductFilters): void {
        this.filters.set(filters);
        this.currentSearch = filters.query;
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
