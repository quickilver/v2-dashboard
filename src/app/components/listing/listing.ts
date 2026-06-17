import {
    Component,
    input,
    output,
    signal,
    computed,
    ChangeDetectionStrategy
} from '@angular/core';
import { IconComponent } from '../icon/icon';
import { InputFieldComponent } from '../fields/input-field/input-field';
import { DropdownFieldComponent } from '../fields/dropdown-field/dropdown-field';
import { DropdownOption } from '../../models/dropdown.model';
import { ListingColumn } from '../../models/listing.model';
import { MetaModel } from '../../models/meta.model';

export interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

@Component({
    selector: 'app-listing',
    standalone: true,
    imports: [IconComponent, InputFieldComponent, DropdownFieldComponent],
    templateUrl: './listing.html',
    styleUrl: './listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'listing-wrapper'
    }
})
export class ListingComponent {
    columns = input<ListingColumn[]>([]);
    data = input<any[]>([]);
    loading = input<boolean>(false);
    meta = input<MetaModel | null>(null);
    pageSize = input<number>(20);
    page = input<number>(1);
    searchable = input<boolean>(true);
    sortable = input<boolean>(true);
    title = input<string>('');
    actionsColumn = input<boolean>(false);

    sortChange = output<SortState>();
    pageChange = output<number>();
    searchChange = output<string | number>();
    rowClick = output<any>();
    editClick = output<any>();
    deleteClick = output<any>();
    createClick = output();

    searchQuery = signal<string | number>('');
    sortState = signal<SortState | null>(null);

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

    onEditClick(item: any): void {
        this.editClick.emit(item);
    }

    onDeleteClick(item: any): void {
        this.deleteClick.emit(item);
    }

    getRowActions(item: any): DropdownOption[] {
        return [
            {
                label: 'Редактировать',
                action: () => this.onEditClick(item)
            },
            {
                label: 'Удалить',
                action: () => this.onDeleteClick(item)
            }
        ];
    }

    trackByFn(index: number, item: any): any {
        return item?.id ?? index;
    }

    trackByColumn(index: number, column: ListingColumn): string {
        return column.key;
    }
}
