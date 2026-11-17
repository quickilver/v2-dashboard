import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    input,
    output,
    signal,
} from '@angular/core';
import { IconComponent } from '../../icon/icon';

@Component({
    selector: 'app-listing-page-sizes',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './listing-page-sizes.html',
    styleUrl: './listing-page-sizes.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'onDocumentClick($event)',
    },
})
export class ListingPageSizesComponent {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    pageSize = input<number>(50);
    changed = output<number>();

    isOpen = signal<boolean>(false);

    options: number[] = [20, 50, 100];

    toggleOpen(): void {
        this.isOpen.update((value) => !value);
    }

    close(): void {
        this.isOpen.set(false);
    }

    select(value: number): void {
        this.changed.emit(value);
        this.close();
    }

    isActive(value: number): boolean {
        return this.pageSize() === value;
    }

    onDocumentClick(event: MouseEvent): void {
        if (!this.isOpen()) {
            return;
        }

        const target = event.target as Node | null;
        const host = this.elementRef.nativeElement;

        if (target && !host.contains(target)) {
            this.close();
        }
    }
}
