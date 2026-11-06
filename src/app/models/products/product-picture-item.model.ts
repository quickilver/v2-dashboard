/**
 * Элемент списка изображений в редакторе товара.
 * `id` заполнен для сохранённых изображений, `file` — для новых.
 */
export interface ProductPictureItem {
    id: number | null;
    file: File | null;
    previewUrl: string;
    is_main: boolean;
    position: number;
}
