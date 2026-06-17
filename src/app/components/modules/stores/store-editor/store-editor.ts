import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    OnInit
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CheckboxFieldComponent } from '../../../fields/checkbox-field/checkbox-field';
import { StoreService } from '../../../../services/store.service';
import { PopupService } from '../../../../services/popup.service';
import { StoreModel } from '../../../../models/store.model';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-store-editor',
    standalone: true,
    imports: [InputFieldComponent, CheckboxFieldComponent],
    templateUrl: './store-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreEditorComponent implements OnInit {
    private readonly storeService = inject(StoreService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);

    guid = model<string>('');
    title = model<string>('');
    address = model<string>('');
    display = model<boolean>(true);

    ngOnInit(): void {
        const storeId = this.id();
        if (storeId) {
            this.isEditMode.set(true);
            this.loadStore(storeId);
        }
    }

    private async loadStore(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.storeService.show(id);
            const store = response.data;
            this.guid.set(store.guid);
            this.title.set(store.title);
            this.address.set(store.address);
            this.display.set(store.display);
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные магазина');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<StoreModel> = {
                guid: this.guid().trim(),
                title: this.title().trim(),
                address: this.address().trim(),
                display: this.display()
            };

            if (this.isEditMode()) {
                await this.storeService.update(this.id()!, data);
            } else {
                await this.storeService.create(data);
            }

            this.notificationService.success('Магазин успешно сохранен');
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
