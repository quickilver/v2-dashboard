import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { ConfirmService } from '../../../../services/confirm.service';
import { ProductPictureItem } from '../../../../models/products/product-picture-item.model';

@Component({
    selector: 'app-products-editor-media',
    standalone: true,
    imports: [],
    templateUrl: './products-editor-media.html',
    styleUrl: './products-editor-media.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsEditorMediaComponent {
    private readonly confirmService = inject(ConfirmService);

    pictures = model<ProductPictureItem[]>([]);
    dragIndex = signal<number | null>(null);

    hasPictures = computed<boolean>(() => this.pictures().length > 0);

    onFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);

        if (files.length > 0) {
            this.addFiles(files);
        }

        input.value = '';
    }

    onDropFiles(event: DragEvent): void {
        event.preventDefault();

        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
            file.type.startsWith('image/'),
        );

        if (files.length > 0) {
            this.addFiles(files);
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
    }

    private addFiles(files: File[]): void {
        const items = this.pictures();
        const hasMain = items.some((item) => item.is_main);

        const newItems: ProductPictureItem[] = files.map((file, index) => ({
            id: null,
            file,
            previewUrl: URL.createObjectURL(file),
            is_main: !hasMain && index === 0,
            position: items.length + index + 1,
        }));

        this.pictures.set([...items, ...newItems]);
    }

    async onDelete(item: ProductPictureItem): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление изображения',
            'Вы уверены, что хотите удалить изображение?',
            'Удалить',
            'Отмена',
        );

        if (!confirmed) return;

        if (item.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(item.previewUrl);
        }

        const remaining = this.pictures()
            .filter((picture) => picture !== item)
            .map((picture, index) => ({ ...picture, position: index + 1 }));

        if (item.is_main && remaining.length > 0) {
            remaining[0] = { ...remaining[0], is_main: true };
        }

        this.pictures.set(remaining);
    }

    onSetMain(item: ProductPictureItem): void {
        this.pictures.update((items) =>
            items.map((picture) => ({ ...picture, is_main: picture === item })),
        );
    }

    onDragStart(index: number): void {
        this.dragIndex.set(index);
    }

    onDrop(index: number): void {
        const from = this.dragIndex();

        if (from === null || from === index) {
            this.dragIndex.set(null);
            return;
        }

        this.pictures.update((items) => {
            const reordered = [...items];
            const [moved] = reordered.splice(from, 1);
            reordered.splice(index, 0, moved);

            return reordered.map((picture, position) => ({ ...picture, position: position + 1 }));
        });

        this.dragIndex.set(null);
    }

    imageUrl(item: ProductPictureItem): string {
        return item.previewUrl;
    }
}
