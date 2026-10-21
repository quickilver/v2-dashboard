import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
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
    protected readonly popupService = inject(PopupService);

    protected top = computed(() => {
        const stack = this.popupService.stack();
        return stack[0] ?? null;
    });

    protected getInputs(entry: { inputs: Record<string, unknown> }): Record<string, unknown> {
        return entry.inputs;
    }

    protected closeTop(): void {
        this.popupService.resolve();
    }
}
