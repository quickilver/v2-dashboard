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
import { DeliveryService } from '../../../../services/delivery.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { DeliveryModel } from '../../../../models/delivery.model';
import { SkeletonComponent } from '../../../skeleton/skeleton';

@Component({
    selector: 'app-deliveries-editor',
    standalone: true,
    imports: [InputFieldComponent, TextareaFieldComponent, SkeletonComponent],
    templateUrl: './deliveries-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveriesEditorComponent implements OnInit {
    private readonly deliveryService = inject(DeliveryService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);
    duplicateFromId = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);

    title = model<string>('');
    description = model<string>('');
    position = model<number>(0);

    ngOnInit(): void {
        const deliveryId: number | null = this.id() ?? this.duplicateFromId();
        if (deliveryId !== null) {
            this.isEditMode.set(this.id() !== null);
            this.loadDelivery(deliveryId);
        }
    }

    private async loadDelivery(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.deliveryService.show(id);
            const delivery = response.data;
            this.title.set(delivery.title);
            this.description.set(delivery.description ?? '');
            this.position.set(delivery.position);
        } catch (error) {
            this.notificationService.error('Не удалось загрузить данные способа доставки');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<DeliveryModel> = {
                title: this.title().trim(),
                description: this.description().trim() || null,
                position: this.position(),
            };

            if (this.isEditMode()) {
                await this.deliveryService.update(this.id()!, data);
            } else {
                await this.deliveryService.create(data);
            }

            this.notificationService.success('Способ доставки успешно сохранён');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response.error?.message ?? 'Ошибка при сохранении способа доставки',
            );
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }
}
