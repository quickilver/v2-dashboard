import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    model,
    OnInit,
    signal,
} from '@angular/core';
import { ReceiveFormComponent } from '../receive-form/receive-form';
import { ReceiveProductsSearchComponent } from '../receive-products-search/receive-products-search';
import { ReceiveProductsListComponent } from '../receive-products-list/receive-products-list';
import { SkeletonComponent } from '../../../skeleton/skeleton';
import { ProductIndex } from '../../../../models/products/product-short.model';
import { SupplierModel } from '../../../../models/supplier.model';
import { ReceiveCreateRequest } from '../../../../models/receives/receive-create-request.model';
import { ReceiveService } from '../../../../services/receive.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-receives-editor',
    standalone: true,
    imports: [
        ReceiveFormComponent,
        ReceiveProductsSearchComponent,
        ReceiveProductsListComponent,
        SkeletonComponent,
    ],
    templateUrl: './receives-editor.html',
    styleUrl: './receives-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivesEditorComponent implements OnInit {
    private readonly receiveService = inject(ReceiveService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('form');

    storeId = model<number | null>(null);
    priceId = model<number | null>(null);
    supplier = model<SupplierModel | null>(null);
    payed = model<number>(0);
    comment = model<string>('');

    products = signal<ProductIndex[]>([]);
    counts = signal<Record<number, number>>({});
    purchases = signal<Record<number, number>>({});
    newPrices = signal<Record<number, number>>({});

    canSubmit = computed<boolean>(
        () =>
            this.storeId() !== null &&
            this.priceId() !== null &&
            this.supplier() !== null &&
            this.products().length > 0 &&
            !this.saving(),
    );

    ngOnInit(): void {
        const receiveId = this.id();
        if (receiveId) {
            this.isEditMode.set(true);
            this.loadReceive(receiveId);
        }
    }

    private async loadReceive(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.receiveService.show(id);
            const receive = response.data;

            this.storeId.set(receive.store?.id ?? null);
            this.supplier.set(receive.supplier);
            this.payed.set(receive.payed);
            this.comment.set(receive.comment ?? '');

            const products: ProductIndex[] = [];
            const counts: Record<number, number> = {};
            const purchases: Record<number, number> = {};
            const newPrices: Record<number, number> = {};
            let priceId: number | null = null;

            for (const item of receive.products) {
                products.push(item.product);
                counts[item.product.id] = item.count;
                purchases[item.product.id] = item.purchase_price;

                if (item.new_value !== null) {
                    newPrices[item.product.id] = item.new_value;
                }

                if (item.price) {
                    priceId = item.price.id;
                }
            }

            this.products.set(products);
            this.counts.set(counts);
            this.purchases.set(purchases);
            this.newPrices.set(newPrices);
            this.priceId.set(priceId);
        } catch {
            this.notificationService.error('Не удалось загрузить данные поступления');
        } finally {
            this.loading.set(false);
        }
    }

    onProductSelected(product: ProductIndex): void {
        const alreadyAdded: boolean = this.products().some(
            (existingProduct) => existingProduct.id === product.id,
        );

        if (alreadyAdded) {
            return;
        }

        this.products.update((products) => [...products, product]);
        this.counts.update((counts) => ({ ...counts, [product.id]: 1 }));
    }

    onProductRemoved(product: ProductIndex): void {
        this.products.update((products) =>
            products.filter((existingProduct) => existingProduct.id !== product.id),
        );
        this.counts.update((counts) => {
            const { [product.id]: removedCount, ...restCounts } = counts;
            return restCounts;
        });
        this.purchases.update((purchases) => {
            const { [product.id]: removedPurchase, ...restPurchases } = purchases;
            return restPurchases;
        });
        this.newPrices.update((newPrices) => {
            const { [product.id]: removedPrice, ...restPrices } = newPrices;
            return restPrices;
        });
    }

    async onSave(): Promise<void> {
        const storeId: number | null = this.storeId();
        const priceId: number | null = this.priceId();
        const supplier: SupplierModel | null = this.supplier();

        if (!this.canSubmit() || storeId === null || priceId === null || supplier === null) {
            return;
        }

        const request: ReceiveCreateRequest = {
            store_id: storeId,
            supplier_id: supplier.id,
            comment: this.comment().trim() || null,
            payed: this.payed(),
            products: this.products().map((product) => ({
                product_id: product.id,
                price_id: priceId,
                count: this.counts()[product.id] ?? 1,
                purchase_price: this.purchases()[product.id] ?? 0,
                new_value: this.newPrices()[product.id] ?? null,
            })),
        };

        this.saving.set(true);

        try {
            if (this.isEditMode()) {
                await this.receiveService.update(this.id()!, request);
            } else {
                await this.receiveService.create(request);
            }

            this.notificationService.success('Поступление успешно сохранено');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response.error?.message ?? 'Ошибка при сохранении поступления',
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
