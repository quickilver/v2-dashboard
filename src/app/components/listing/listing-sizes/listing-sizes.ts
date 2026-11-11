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
import { ListingSize } from '../../../models/listing.model';

export interface ListingSizeOption {
    value: ListingSize;
    title: string;
}

@Component({
    selector: 'app-listing-sizes',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './listing-sizes.html',
    styleUrl: './listing-sizes.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'onDocumentClick($event)',
    },
})
export class ListingSizesComponent {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    size = input<ListingSize>('normal');
    changed = output<ListingSize>();

    isOpen = signal<boolean>(false);

    options: ListingSizeOption[] = [
        { value: 'large', title: 'Крупный' },
        { value: 'normal', title: 'Обычный' },
        { value: 'small', title: 'Мелкий' },
    ];

    toggleOpen(): void {
        this.isOpen.update((value) => !value);
    }

    close(): void {
        this.isOpen.set(false);
    }

    select(value: ListingSize): void {
        this.changed.emit(value);
        this.close();
    }

    isActive(value: ListingSize): boolean {
        return this.size() === value;
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
