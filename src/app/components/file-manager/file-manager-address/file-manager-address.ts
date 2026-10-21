import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-file-manager-address',
    standalone: true,
    imports: [
        IconComponent
    ],
    templateUrl: './file-manager-address.html',
    styleUrl: './file-manager-address.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerAddressComponent {
    readonly path = input<string>('');
    readonly navigate = output<string>();

    readonly segments = computed<string[]>(() => {
        return this.path()
            ? this.path().split('/').filter(s => s.length > 0)
            : [];
    });

    segmentPath(index: number): string {
        return this.segments().slice(0, index + 1).join('/');
    }
}
