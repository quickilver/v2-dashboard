import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    model,
    OnInit,
    signal,
} from '@angular/core';
import { SelectFieldComponent, SelectOption } from '../../../fields/select-field/select-field';
import { AutocompleteSuppliersFieldComponent } from '../../../fields/autocomplete-suppliers-field/autocomplete-suppliers-field';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { TextareaFieldComponent } from '../../../fields/textarea-field/textarea-field';
import { StoreService } from '../../../../services/store.service';
import { PriceService } from '../../../../services/price.service';
import { NotificationService } from '../../../../services/notification.service';
import { StoreModel } from '../../../../models/store.model';
import { PriceModel } from '../../../../models/price.model';
import { SupplierModel } from '../../../../models/supplier.model';

@Component({
    selector: 'app-receive-form',
    standalone: true,
    imports: [
        SelectFieldComponent,
        AutocompleteSuppliersFieldComponent,
        InputFieldComponent,
        TextareaFieldComponent,
    ],
    templateUrl: './receive-form.html',
    styleUrl: './receive-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiveFormComponent implements OnInit {
    private readonly storeService = inject(StoreService);
    private readonly priceService = inject(PriceService);
    private readonly notificationService = inject(NotificationService);

    storeId = model<number | null>(null);
    priceId = model<number | null>(null);
    supplier = model<SupplierModel | null>(null);
    payed = model<number>(0);
    comment = model<string>('');

    stores = signal<StoreModel[]>([]);
    prices = signal<PriceModel[]>([]);
    loading = signal<boolean>(false);

    storeOptions = computed<SelectOption[]>(() =>
        this.stores().map((store) => ({ label: store.title, value: store.id })),
    );

    priceOptions = computed<SelectOption[]>(() =>
        this.prices().map((price) => ({ label: price.title, value: price.id })),
    );

    ngOnInit(): void {
        this.loadStores();
        this.loadPrices();
    }

    private async loadStores(): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.storeService.index({ per_page: 100 });
            this.stores.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить склады');
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

    onPayedChange(value: string | number): void {
        const amount: number = Number(value);
        this.payed.set(Number.isFinite(amount) ? amount : 0);
    }
}
