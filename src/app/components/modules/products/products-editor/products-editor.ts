import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    computed,
    inject,
    input,
    model,
    signal,
    OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CounterFieldComponent } from '../../../fields/counter-field/counter-field';
import { WyswigFieldComponent } from '../../../fields/wyswig-field/wyswig-field';
import { CategoriesTreeComponent } from '../../../categories-tree/categories-tree';
import { ProductsEditorAttributesComponent } from '../products-editor-attributes/products-editor-attributes';
import { ProductsEditorMediaComponent } from '../products-editor-media/products-editor-media';
import { ProductsMetadataPopupComponent } from '../products-metadata-popup/products-metadata-popup';
import type { GeneratedProductMetadata } from '../../../../models/products/generated-product-metadata.model';
import { OpenRouterService } from '../../../../services/open-router.service';
import { ProductService } from '../../../../services/product.service';
import { PriceService } from '../../../../services/price.service';
import { StoreService } from '../../../../services/store.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { PriceModel } from '../../../../models/price.model';
import { StoreModel } from '../../../../models/store.model';
import { ProductAttribute } from '../../../../models/products/product-attribute.model';
import { ProductAttributeValueRequest } from '../../../../models/products/product-attribute-value-request.model';
import { ProductPriceRequest } from '../../../../models/products/product-price-request.model';
import { ProductStoreRequest } from '../../../../models/products/product-store-request.model';
import { ProductCreateRequest } from '../../../../models/products/product-create-request.model';
import { ProductPictureItem } from '../../../../models/products/product-picture-item.model';
import { ProductPictureModel } from '../../../../models/products/product-picture.model';
import { SkeletonComponent } from '../../../skeleton/skeleton';

@Component({
    selector: 'app-products-editor',
    standalone: true,
    imports: [
        FormsModule,
        InputFieldComponent,
        CounterFieldComponent,
        WyswigFieldComponent,
        CategoriesTreeComponent,
        ProductsEditorAttributesComponent,
        ProductsEditorMediaComponent,
        SkeletonComponent,
    ],
    templateUrl: './products-editor.html',
    styleUrl: './products-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsEditorComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly openRouter = inject(OpenRouterService);
    private readonly productService = inject(ProductService);
    private readonly priceService = inject(PriceService);
    private readonly storeService = inject(StoreService);
    private readonly popupService = inject(PopupService);
    readonly generatingDescription = signal<boolean>(false);

    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);
    duplicateFromId = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    title = model<string>('');
    sku = model<string>('');
    description = model<string>('');
    categories = model<number | number[] | null>(null);

    prices = signal<PriceModel[]>([]);
    attributes = signal<ProductAttribute[]>([]);
    stores = signal<StoreModel[]>([]);
    pictures = signal<ProductPictureItem[]>([]);

    priceAmounts = signal<Record<number, number | undefined>>({});
    storeCounts = signal<Record<number, number | undefined>>({});

    pricesCount = computed<number>(() => {
        const amounts = this.priceAmounts();
        return this.prices().filter((price) => {
            const amount = amounts[price.id];
            return amount !== undefined && amount > 0;
        }).length;
    });

    storesTotal = computed<number>(() => {
        const counts = this.storeCounts();
        return this.stores().reduce((total, store) => total + (counts[store.id] ?? 0), 0);
    });

    hasDescription = computed<boolean>(() => {
        const description: string = this.description();
        const text: string = description
            .replace(/<[^>]*>/g, '')
            .replace(/&(?:nbsp|#160|#x0*a0);|\u200b/gi, '')
            .trim();

        return text.length > 0 || /<(?:img|video|audio|iframe)\b/i.test(description);
    });

    attributesCount = computed<number>(() => this.attributes().length);

    picturesCount = computed<number>(() => this.pictures().length);

    categoriesCount = computed<number>(() => this.getCategoryIds().length);

    ngOnInit(): void {
        const productId: number | null = this.id() ?? this.duplicateFromId();
        if (productId !== null) {
            this.isEditMode.set(this.id() !== null);
            this.loadProduct(productId);
        }

        this.loadPrices();
        this.loadStores();
    }

    private async loadProduct(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.productService.show(id);
            const product = response.data;
            this.title.set(product.title);
            this.sku.set(this.isEditMode() ? product.sku : '');
            this.description.set(product.description ?? '');

            if (product.categories && product.categories.length > 0) {
                this.categories.set(product.categories.map((c) => c.id));
            }

            const priceAmounts: Record<number, number | undefined> = {};
            for (const price of product.prices) {
                priceAmounts[price.id] = price.amount;
            }
            this.priceAmounts.set(priceAmounts);

            const storeCounts: Record<number, number | undefined> = {};
            if (this.isEditMode()) {
                for (const store of product.stores) {
                    storeCounts[store.id] = store.count;
                }
                this.pictures.set(this.mapPictures(product.pictures ?? []));
            }

            this.attributes.set(product.attribute ?? []);
            this.storeCounts.set(storeCounts);
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные товара');
        } finally {
            this.loading.set(false);
        }
    }

    private async loadPrices(): Promise<void> {
        try {
            const response = await this.priceService.index({ per_page: 100 });
            this.prices.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить типы цен');
        }
    }

    private async loadStores(): Promise<void> {
        try {
            const response = await this.storeService.index({ per_page: 100 });
            this.stores.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить склады');
        }
    }

    async fillDescription(): Promise<void> {
        const title: string = this.title().trim();
        if (!title || this.generatingDescription()) return;

        const previousDescription: string = this.description();
        this.generatingDescription.set(true);
        try {
            const result: GeneratedProductMetadata | undefined =
                await this.popupService.open<GeneratedProductMetadata>(
                    'Заполнить описание',
                    ProductsMetadataPopupComponent,
                    { title, replaceDescription: previousDescription.trim() !== '' },
                    'with-tabs',
                );
            if (!result) return;

            if (this.title().trim() !== title || this.description() !== previousDescription) {
                this.notificationService.info('Название или описание изменилось. Запустите заполнение снова.');
                return;
            }

            const paragraph: HTMLDivElement = document.createElement('div');
            paragraph.textContent = result.description;
            this.description.set(paragraph.innerHTML.replace(/\r?\n/g, '<br>'));

            const attributes: ProductAttribute[] = [...this.attributes()];
            const attributeKey = (name: string): string =>
                name.trim().replace(/\s+/g, ' ').toLowerCase().replaceAll('ё', 'е');
            const knownTitles = new Set<string>(
                attributes.map((attribute) => attributeKey(attribute.title)),
            );
            const knownIds = new Set<number>(attributes.map((attribute) => attribute.id));
            let position: number = Math.max(0, ...attributes.map((attribute) => attribute.position));
            for (const attribute of result.attributes) {
                const id: number = attribute.attribute_id ?? 0;
                const name: string = attribute.title.trim();
                const value: string = attribute.value.trim();
                const key: string = attributeKey(name);
                if (!name || !value || knownTitles.has(key) || (id > 0 && knownIds.has(id))) {
                    continue;
                }

                knownTitles.add(key);
                if (id > 0) knownIds.add(id);
                attributes.push({ id, value_id: 0, title: name, value, position: ++position });
            }
            this.attributes.set(attributes);
            this.changeTab('description');
            this.notificationService.success('Описание и характеристики добавлены в форму');
            if (result.image_urls?.length) {
                await this.addSuggestedPictures(result.image_urls);
            }
        } finally {
            this.generatingDescription.set(false);
        }
    }

    private async addSuggestedPictures(urls: string[]): Promise<void> {
        const extensions: Readonly<Record<string, string>> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/bmp': 'bmp',
            'image/x-ms-bmp': 'bmp',
        };
        const existingUrls: Set<string | undefined> = new Set(this.pictures().map((picture) => picture.sourceUrl));
        const pendingUrls: string[] = [...new Set(urls)].filter((url) => !existingUrls.has(url));
        const downloads: PromiseSettledResult<{ file: File; sourceUrl: string }>[] = await Promise.allSettled(
            pendingUrls.map(async (url: string, index: number) => {
                const blob: Blob = await this.openRouter.productPhoto(url);
                const extension: string | undefined = Object.hasOwn(extensions, blob.type) ? extensions[blob.type] : undefined;
                if (!extension || !blob.size) throw new Error('Недоступное изображение');

                return {
                    file: new File([blob], `product-photo-${index + 1}.${extension}`, { type: blob.type }),
                    sourceUrl: url,
                };
            }),
        );
        if (this.destroyRef.destroyed) return;

        const photos: { file: File; sourceUrl: string }[] = downloads.flatMap((download) =>
            download.status === 'fulfilled' ? [download.value] : [],
        );

        if (photos.length) {
            this.pictures.update((pictures) => {
                const hasMain: boolean = pictures.some((picture) => picture.is_main);
                return [...pictures, ...photos.map(({ file, sourceUrl }, index: number): ProductPictureItem => ({
                    id: null,
                    file,
                    sourceUrl,
                    previewUrl: URL.createObjectURL(file),
                    is_main: !hasMain && index === 0,
                    position: pictures.length + index + 1,
                }))];
            });
            this.changeTab('media');
        }

        const failedCount: number = downloads.length - photos.length;
        if (failedCount) {
            this.notificationService.warning(
                `Не удалось добавить фото: ${failedCount}`,
                'Проверьте, что ссылки ведут напрямую на доступные изображения размером до 8 МБ.',
            );
        }
    }

    async onSave(): Promise<void> {
        if (this.saving()) return;

        this.saving.set(true);

        try {
            const categoryIds: number[] = this.getCategoryIds();

            const prices: ProductPriceRequest[] = this.prices()
                .filter((price) => {
                    const amount = this.priceAmounts()[price.id];
                    return amount !== undefined && amount > 0;
                })
                .map((price) => ({
                    id: price.id,
                    amount: this.priceAmounts()[price.id] ?? 0,
                }));

            const stores: ProductStoreRequest[] = this.stores()
                .filter((store) => {
                    const count = this.storeCounts()[store.id];
                    return count !== undefined && count >= 0;
                })
                .map((store) => ({
                    id: store.id,
                    count: this.storeCounts()[store.id] ?? 0,
                }));

            const attributeValues: ProductAttributeValueRequest[] = this.attributes()
                .filter((attribute) => attribute.value.trim().length > 0)
                .map((attribute) => {
                    if (attribute.value_id > 0) {
                        return {
                            id: attribute.value_id,
                            position: attribute.position,
                        };
                    }

                    if (attribute.id > 0) {
                        return {
                            attribute_id: attribute.id,
                            value: attribute.value.trim(),
                            position: attribute.position,
                        };
                    }

                    return {
                        attribute_title: attribute.title.trim(),
                        value: attribute.value.trim(),
                        position: attribute.position,
                    };
                });

            const data: ProductCreateRequest = {
                title: this.title().trim(),
                sku: this.sku().trim(),
                description: this.description() || null,
                categories: categoryIds,
                attribute_values: attributeValues,
                prices,
                stores,
            };

            if (this.isEditMode()) {
                await this.productService.update(this.id()!, data, this.buildPicturesPayload());
            } else {
                await this.productService.create(data, this.buildPicturesPayload());
            }

            this.notificationService.success('Товар успешно сохранён');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response.error?.message ?? 'Ошибка при сохранении товара',
            );
        } finally {
            this.saving.set(false);
        }
    }

    /**
     * Преобразует сохранённые изображения товара в элементы редактора.
     */
    private mapPictures(pictures: ProductPictureModel[]): ProductPictureItem[] {
        return [...pictures]
            .sort((a, b) => a.position - b.position)
            .map((picture) => ({
                id: picture.id,
                file: null,
                previewUrl: picture.preview_url ?? picture.url ?? '',
                is_main: picture.is_main,
                position: picture.position,
            }));
    }

    /**
     * Формирует список изображений для отправки вместе с товаром.
     */
    private buildPicturesPayload(): ProductPictureItem[] {
        return this.pictures().map((picture, index) => ({
            ...picture,
            position: index + 1,
        }));
    }

    private getCategoryIds(): number[] {
        const value = this.categories();
        if (value === null || value === undefined) {
            return [];
        }
        if (Array.isArray(value)) {
            return value;
        }
        return [value];
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

    onPriceAmountChange(priceId: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        const amounts = { ...this.priceAmounts() };
        amounts[priceId] = parseFloat(input.value) || 0;
        this.priceAmounts.set(amounts);
    }

    onStoreCountChange(storeId: number, count: number): void {
        const counts = { ...this.storeCounts() };
        counts[storeId] = count;
        this.storeCounts.set(counts);
    }
}
