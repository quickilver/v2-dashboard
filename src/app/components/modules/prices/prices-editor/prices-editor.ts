import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    OnInit,
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { PriceService } from '../../../../services/price.service';
import { PopupService } from '../../../../services/popup.service';
import { PriceModel } from '../../../../models/price.model';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-prices-editor',
    standalone: true,
    imports: [InputFieldComponent],
    templateUrl: './prices-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricesEditorComponent implements OnInit {
    private readonly priceService = inject(PriceService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);

    guid = model<string>('');
    title = model<string>('');
    currency = model<string>('');

    ngOnInit(): void {
        const priceId = this.id();
        if (priceId) {
            this.isEditMode.set(true);
            this.loadPrice(priceId);
        }
    }

    private async loadPrice(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.priceService.show(id);
            const price = response.data;
            this.guid.set(price.guid);
            this.title.set(price.title);
            this.currency.set(price.currency);
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные цены');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<PriceModel> = {
                guid: this.guid().trim(),
                title: this.title().trim(),
                currency: this.currency().trim(),
            };

            if (this.isEditMode()) {
                await this.priceService.update(this.id()!, data);
            } else {
                await this.priceService.create(data);
            }

            this.notificationService.success('Цена успешно сохранена');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(response.error.message);
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }
}
