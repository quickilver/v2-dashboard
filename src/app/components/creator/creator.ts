import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PopupService } from '../../services/popup.service';
import { CheckoutComponent } from '../checkout/checkout';

@Component({
    selector: 'app-creator',
    standalone: true,
    template: `<button type="button" (click)="openCheckout()">Касса</button>`,
    styleUrl: './creator.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorComponent {
    private readonly popupService = inject(PopupService);

    openCheckout(): void {
        void this.popupService.open('Оформление', CheckoutComponent);
    }
}
