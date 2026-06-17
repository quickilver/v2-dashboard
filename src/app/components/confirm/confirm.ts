import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm.service';

@Component({
    selector: 'app-confirm',
    imports: [],
    templateUrl: './confirm.html',
    styleUrl: './confirm.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmComponent {
    protected readonly confirmService: ConfirmService = inject(ConfirmService);

    onConfirm(): void {
        this.confirmService.resolve(true);
    }

    onCancel(): void {
        this.confirmService.resolve(false);
    }
}
