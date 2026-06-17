import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { PopupService } from '../../services/popup.service';

@Component({
    selector: 'app-popup',
    imports: [NgComponentOutlet],
    templateUrl: './popup.html',
    styleUrl: './popup.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent {
    protected readonly popupService: PopupService = inject(PopupService);

    protected getInputs(): Record<string, unknown> {
        return this.popupService.inputs();
    }
}
