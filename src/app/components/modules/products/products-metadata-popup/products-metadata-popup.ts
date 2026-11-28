import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import type { GeneratedProductMetadata } from '../../../../models/products/generated-product-metadata.model';
import { OpenRouterService } from '../../../../services/open-router.service';
import { PopupService } from '../../../../services/popup.service';
import { SkeletonComponent } from '../../../skeleton/skeleton';

@Component({
    selector: 'app-products-metadata-popup',
    standalone: true,
    imports: [SkeletonComponent],
    templateUrl: './products-metadata-popup.html',
    styleUrl: './products-metadata-popup.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsMetadataPopupComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly openRouter = inject(OpenRouterService);
    private readonly popupService = inject(PopupService);

    readonly title = input.required<string>();
    readonly replaceDescription = input<boolean>(false);
    readonly tab = signal<'description' | 'attributes' | 'media'>('description');
    readonly loading = signal<boolean>(false);
    readonly errorMessage = signal<string | null>(null);
    readonly result = signal<GeneratedProductMetadata | null>(null);

    ngOnInit(): void {
        void this.loadMetadata();
    }

    apply(): void {
        const result: GeneratedProductMetadata | null = this.result();
        if (result) this.popupService.resolve(result);
    }

    removeAttribute(title: string): void {
        this.result.update((result) => result && {
            ...result,
            attributes: result.attributes.filter((attribute) => attribute.title !== title),
        });
    }

    removePhoto(url: string): void {
        this.result.update((result) => result && {
            ...result,
            image_urls: result.image_urls?.filter((imageUrl) => imageUrl !== url),
        });
    }

    cancel(): void {
        this.popupService.resolve();
    }

    async loadMetadata(): Promise<void> {
        if (this.loading()) return;

        this.loading.set(true);
        this.errorMessage.set(null);
        this.result.set(null);

        try {
            this.result.set(await this.openRouter.productMetadata(this.title(), this.destroyRef));
        } catch (error: unknown) {
            const message: unknown = error instanceof HttpErrorResponse ? error.error?.message : error instanceof Error ? error.message : null;
            const fallback: string = error instanceof HttpErrorResponse && error.status === 504
                ? 'Поиск занял слишком много времени. Нажмите «Повторить».'
                : 'Не удалось заполнить описание товара.';
            this.errorMessage.set(typeof message === 'string' ? message : fallback);
        } finally {
            this.loading.set(false);
        }
    }
}
