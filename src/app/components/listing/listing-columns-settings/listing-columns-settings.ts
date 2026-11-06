import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    computed,
    inject,
    input,
    model,
    output,
    signal,
} from '@angular/core';
import { IconComponent } from '../../icon/icon';
import { ListingColumn } from '../../../models/listing.model';

@Component({
    selector: 'app-listing-columns-settings',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './listing-columns-settings.html',
    styleUrl: './listing-columns-settings.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'onDocumentClick($event)',
    },
})
export class ListingColumnsSettingsComponent {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    available = input<ListingColumn[]>([]);
    visibleKeys = model<string[]>([]);
    changed = output<string[]>();

    isOpen = signal<boolean>(false);
    dragIndex = signal<number | null>(null);

    orderedColumns = computed<ListingColumn[]>(() => {
        const columnsByKey = new Map(this.available().map((column) => [column.key, column]));
        const visibleKeys = this.visibleKeys();
        const visible = new Set(visibleKeys);

        const visibleColumns = visibleKeys
            .map((key) => columnsByKey.get(key))
            .filter((column): column is ListingColumn => !!column);

        const hiddenColumns = this.available().filter((column) => !visible.has(column.key));

        return [...visibleColumns, ...hiddenColumns];
    });

    toggleOpen(): void {
        this.isOpen.update((value) => !value);
    }

    close(): void {
        this.isOpen.set(false);
    }

    onDocumentClick(event: MouseEvent): void {
        if (!this.isOpen()) {
            return;
        }

        const target = event.target as Node | null;
        const host = this.elementRef.nativeElement;

        if (target && !host.contains(target)) {
            this.close();
        }
    }

    isVisible(key: string): boolean {
        return this.visibleKeys().includes(key);
    }

    toggleColumn(key: string): void {
        const keys = this.visibleKeys();

        if (keys.includes(key)) {
            if (keys.length === 1) {
                return;
            }

            this.update(keys.filter((item) => item !== key));
            return;
        }

        this.update([...keys, key]);
    }

    onDragStart(index: number): void {
        if (index >= this.visibleKeys().length) {
            return;
        }

        this.dragIndex.set(index);
    }

    onDrop(index: number): void {
        const from = this.dragIndex();

        if (from === null || from === index) {
            this.dragIndex.set(null);
            return;
        }

        const keys = [...this.visibleKeys()];
        const [moved] = keys.splice(from, 1);
        keys.splice(index, 0, moved);

        this.dragIndex.set(null);
        this.update(keys);
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
    }

    private update(keys: string[]): void {
        this.visibleKeys.set(keys);
        this.changed.emit(keys);
    }
}
