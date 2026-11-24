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
import { PaymentService } from '../../../../services/payment.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { PaymentModel } from '../../../../models/payment.model';
import { SkeletonComponent } from '../../../skeleton/skeleton';

@Component({
    selector: 'app-payments-editor',
    standalone: true,
    imports: [InputFieldComponent, TextareaFieldComponent, SkeletonComponent],
    templateUrl: './payments-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsEditorComponent implements OnInit {
    private readonly paymentService = inject(PaymentService);
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
        const paymentId: number | null = this.id() ?? this.duplicateFromId();
        if (paymentId !== null) {
            this.isEditMode.set(this.id() !== null);
            this.loadPayment(paymentId);
        }
    }

    private async loadPayment(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.paymentService.show(id);
            const payment = response.data;
            this.title.set(payment.title);
            this.description.set(payment.description ?? '');
            this.position.set(payment.position);
        } catch (error) {
            this.notificationService.error('Не удалось загрузить данные способа оплаты');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<PaymentModel> = {
                title: this.title().trim(),
                description: this.description().trim() || null,
                position: this.position(),
            };

            if (this.isEditMode()) {
                await this.paymentService.update(this.id()!, data);
            } else {
                await this.paymentService.create(data);
            }

            this.notificationService.success('Способ оплаты успешно сохранён');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(
                response.error?.message ?? 'Ошибка при сохранении способа оплаты',
            );
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }
}
