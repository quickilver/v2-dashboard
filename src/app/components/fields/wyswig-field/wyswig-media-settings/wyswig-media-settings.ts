import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

@Component({
    selector: 'app-wyswig-media-settings',
    standalone: true,
    imports: [],
    templateUrl: './wyswig-media-settings.html',
    styleUrl: './wyswig-media-settings.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WyswigMediaSettingsComponent {
    width = model<number | null>(null);
    height = model<number | null>(null);
    lockRatio = model<boolean>(true);

    ratio = input<number | null>(null);

    close = output<void>();
    remove = output<void>();

    widthValue = computed<string>(() => this.width()?.toString() ?? '');
    heightValue = computed<string>(() => this.height()?.toString() ?? '');

    onWidthChange(event: Event): void {
        const value = this.parseSize(event);
        this.width.set(value);

        const ratio = this.ratio();
        if (this.lockRatio() && value !== null && ratio) {
            this.height.set(Math.round(value / ratio));
        }
    }

    onHeightChange(event: Event): void {
        const value = this.parseSize(event);
        this.height.set(value);

        const ratio = this.ratio();
        if (this.lockRatio() && value !== null && ratio) {
            this.width.set(Math.round(value * ratio));
        }
    }

    toggleLockRatio(): void {
        this.lockRatio.update((locked) => !locked);
    }

    private parseSize(event: Event): number | null {
        const input = event.target as HTMLInputElement;
        const parsed = Number.parseInt(input.value, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
}
