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
import { TextareaFieldComponent } from '../../../fields/textarea-field/textarea-field';
import { SupplierService } from '../../../../services/supplier.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { SupplierModel } from '../../../../models/supplier.model';
import { SkeletonComponent } from '../../../skeleton/skeleton';

@Component({
    selector: 'app-suppliers-editor',
    standalone: true,
    imports: [InputFieldComponent, TextareaFieldComponent, SkeletonComponent],
    templateUrl: './suppliers-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersEditorComponent implements OnInit {
    private readonly supplierService = inject(SupplierService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);

    title = model<string>('');
    description = model<string>('');

    ngOnInit(): void {
        const supplierId = this.id();
        if (supplierId) {
            this.isEditMode.set(true);
            this.loadSupplier(supplierId);
        }
    }

    private async loadSupplier(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.supplierService.show(id);
            const supplier = response.data;
            this.title.set(supplier.title);
            this.description.set(supplier.description ?? '');
        } catch (error) {
            this.notificationService.error('Не удалось загрузить данные контрагента');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<SupplierModel> = {
                title: this.title().trim(),
                description: this.description().trim() || null,
            };

            if (this.isEditMode()) {
                await this.supplierService.update(this.id()!, data);
            } else {
                await this.supplierService.create(data);
            }

            this.notificationService.success('Контрагент успешно сохранён');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response.error?.message ?? 'Ошибка при сохранении контрагента',
            );
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }
}
