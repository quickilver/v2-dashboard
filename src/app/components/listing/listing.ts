import {
    Component,
    input,
    output,
    signal,
    computed,
    ChangeDetectionStrategy,
    effect,
    inject,
} from '@angular/core';
import { IconComponent } from '../icon/icon';
import { InputFieldComponent } from '../fields/input-field/input-field';
import { DropdownFieldComponent } from '../fields/dropdown-field/dropdown-field';
import { SkeletonComponent } from '../skeleton/skeleton';
import { DropdownOption } from '../../models/dropdown.model';
import { ListingColumn, ListingSize } from '../../models/listing.model';
import { MetaModel } from '../../models/meta.model';
import { ListingColumnsService } from '../../services/listing-columns.service';
import { ListingSizesService } from '../../services/listing-sizes.service';
import { ListingColumnsSettingsComponent } from './listing-columns-settings/listing-columns-settings';
import { ListingSizesComponent } from './listing-sizes/listing-sizes';

export interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

@Component({
    selector: 'app-listing',
    standalone: true,
    imports: [
        IconComponent,
        InputFieldComponent,
        DropdownFieldComponent,
        SkeletonComponent,
        ListingColumnsSettingsComponent,
        ListingSizesComponent,
    ],
    templateUrl: './listing.html',
    styleUrl: './listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'listing-wrapper',
    },
})
export class ListingComponent {
    private readonly listingColumnsService = inject(ListingColumnsService);
    private readonly listingSizesService = inject(ListingSizesService);

    columns = input<ListingColumn[]>([]);
    availableColumns = input<ListingColumn[]>([]);
    columnsStorageKey = input<string>('');
    sizable = input<boolean>(false);
    data = input<any[]>([]);
    loading = input<boolean>(false);
    meta = input<MetaModel | null>(null);
    pageSize = input<number>(20);
    page = input<number>(1);
    searchable = input<boolean>(true);
    searchPlaceholder = input<string>('Поиск');
    sortable = input<boolean>(true);
    title = input<string>('');
    actionsColumn = input<boolean>(false);

    sortChange = output<SortState>();
    pageChange = output<number>();
    searchChange = output<string | number>();
    rowClick = output<any>();
    cellClick = output<{ row: any; column: ListingColumn }>();
    editClick = output<any>();
    deleteClick = output<any>();
    createClick = output();

    searchQuery = signal<string | number>('');
    sortState = signal<SortState | null>(null);

    visibleColumnKeys = signal<string[]>([]);

    displayColumns = computed<ListingColumn[]>(() => {
        const available = this.availableColumns();
        const keys = this.visibleColumnKeys();

        if (available.length === 0 || keys.length === 0) {
            return this.columns();
        }

        const columnsByKey = new Map(available.map((column) => [column.key, column]));

        return keys
            .map((key) => columnsByKey.get(key))
            .filter((column): column is ListingColumn => !!column);
    });

    settingsColumns = computed<ListingColumn[]>(() => {
        const available = this.availableColumns();

        return available.length > 0 ? available : this.columns();
    });

    tableSize = signal<ListingSize>('normal');

    constructor() {
        effect(() => {
            const available = this.settingsColumns();
            const storageKey = this.columnsStorageKey();

            if (available.length === 0) {
                return;
            }

            const resolved = this.listingColumnsService.getColumns(storageKey, available);
            this.visibleColumnKeys.set(resolved.map((column) => column.key));
        });

        effect(() => {
            if (!this.sizable()) {
                this.tableSize.set('normal');
                return;
            }

            this.tableSize.set(this.listingSizesService.getSize(this.columnsStorageKey()));
        });
    }

    onColumnsChanged(keys: string[]): void {
        this.visibleColumnKeys.set(keys);
        this.listingColumnsService.saveColumns(this.columnsStorageKey(), keys);
    }

    onSizeChanged(size: ListingSize): void {
        this.tableSize.set(size);
        this.listingSizesService.saveSize(this.columnsStorageKey(), size);
    }

    totalPages = computed(() => {
        return this.meta()?.last_page ?? 1;
    });

    pages = computed(() => {
        const meta = this.meta();
        if (!meta) return [];

        const current = meta.current_page;
        const total = meta.last_page;
        const pages: number[] = [];
        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    });

    onSearch(value: string | number): void {
        this.searchQuery.set(value);
        this.searchChange.emit(value);
    }

    onCreateClick(): void {
        this.createClick.emit();
    }

    onSort(column: ListingColumn): void {
        if (!column.sortable) return;

        const current = this.sortState();
        let newDirection: 'asc' | 'desc' = 'asc';

        if (current?.key === column.key) {
            newDirection = current.direction === 'asc' ? 'desc' : 'asc';
        }

        const newState: SortState = { key: column.key, direction: newDirection };
        this.sortState.set(newState);
        this.sortChange.emit(newState);
    }

    getSortIcon(key: string): string {
        const state = this.sortState();
        if (!state || state.key !== key) return 'arrows-up-down';

        return state.direction === 'asc' ? 'chevron-up' : 'chevron-down';
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages()) return;
        this.pageChange.emit(page);
    }

    onRowClick(item: any): void {
        this.rowClick.emit(item);
    }

    onCellClick(item: any, column: ListingColumn): void {
        this.cellClick.emit({ row: item, column });
    }

    onEditClick(item: any): void {
        this.editClick.emit(item);
    }

    onDeleteClick(item: any): void {
        this.deleteClick.emit(item);
    }

    getCellValue(row: any, column: ListingColumn): string {
        if (column.formatter) {
            return column.formatter(row);
        }

        const value = row[column.key];
        return value === null || value === undefined ? '' : String(value);
    }

    getImageUrl(row: any, column: ListingColumn): string {
        if (column.imageUrl) {
            return column.imageUrl(row);
        }

        const value = row[column.key];

        return typeof value === 'string' ? value : '';
    }

    getRowActions(item: any): DropdownOption[] {
        return [
            {
                label: 'Редактировать',
                action: () => this.onEditClick(item),
            },
            {
                label: 'Удалить',
                action: () => this.onDeleteClick(item),
            },
        ];
    }

    trackByFn(index: number, item: any): any {
        return item?.id ?? index;
    }

    trackByColumn(index: number, column: ListingColumn): string {
        return column.key;
    }
}
