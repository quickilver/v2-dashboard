import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    model,
    OnInit,
    signal,
} from '@angular/core';
import { CalendarFieldComponent } from '../../../fields/calendar-field/calendar-field';
import { SelectFieldComponent, SelectOption } from '../../../fields/select-field/select-field';
import { AutocompleteUsersFieldComponent } from '../../../fields/autocomplete-users-field/autocomplete-users-field';
import { AutocompleteSuppliersFieldComponent } from '../../../fields/autocomplete-suppliers-field/autocomplete-suppliers-field';
import { StoreService } from '../../../../services/store.service';
import { NotificationService } from '../../../../services/notification.service';
import { StoreModel } from '../../../../models/store.model';
import { SupplierModel } from '../../../../models/supplier.model';
import { UserShort } from '../../../../models/users/user-short.model';
import { ReceiveReportFilters } from '../../../../models/reports/receive-report-filters.model';

@Component({
    selector: 'app-receive-reports-filters',
    standalone: true,
    imports: [
        CalendarFieldComponent,
        SelectFieldComponent,
        AutocompleteUsersFieldComponent,
        AutocompleteSuppliersFieldComponent,
    ],
    templateUrl: './receive-reports-filters.html',
    styleUrl: './receive-reports-filters.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiveReportsFiltersComponent implements OnInit {
    private readonly storeService = inject(StoreService);
    private readonly notificationService = inject(NotificationService);

    filters = model<ReceiveReportFilters>({
        date_from: '',
        date_to: '',
        store_id: null,
        supplier_id: null,
        user_id: null,
    });

    readonly stores = signal<StoreModel[]>([]);
    readonly managerSearch = signal<string>('');
    readonly selectedManager = model<UserShort | null>(null);
    readonly selectedSupplier = model<SupplierModel | null>(null);

    readonly storeOptions = computed<SelectOption[]>(() =>
        this.stores().map((store) => ({ label: store.title, value: store.id })),
    );

    ngOnInit(): void {
        this.loadStores();
    }

    onDateFromChange(value: string): void {
        this.filters.update((filters) => ({ ...filters, date_from: value }));
    }

    onDateToChange(value: string): void {
        this.filters.update((filters) => ({ ...filters, date_to: value }));
    }

    onStoreChange(storeId: string | number | null): void {
        this.filters.update((filters) => ({
            ...filters,
            store_id: storeId === null ? null : Number(storeId),
        }));
    }

    onManagerChange(user: UserShort | null): void {
        this.filters.update((filters) => ({ ...filters, user_id: user?.id ?? null }));
    }

    onSupplierChange(supplier: SupplierModel | null): void {
        this.filters.update((filters) => ({ ...filters, supplier_id: supplier?.id ?? null }));
    }

    private async loadStores(): Promise<void> {
        try {
            const response = await this.storeService.index({ per_page: 100 });
            this.stores.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить склады');
        }
    }
}
