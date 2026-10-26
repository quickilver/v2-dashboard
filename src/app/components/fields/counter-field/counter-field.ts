import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
    selector: 'app-counter-field',
    standalone: true,
    imports: [],
    templateUrl: './counter-field.html',
    styleUrl: './counter-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterFieldComponent {
    label = input<string>('');
    min = input<number>(0);
    max = input<number | null>(null);
    /** Разрешить редактирование значения напрямую в инпуте. */
    editable = input<boolean>(true);
    /** Шаг изменения при клике по минусу/плюсу. */
    step = input<number>(1);

    value = model<number>(0);

    decrement(): void {
        this.value.update((current) =>
            Math.max(this.min(), (current - this.step())),
        );
    }

    increment(): void {
        this.value.update((current) => {
            const max = this.max();
            const next = current + this.step();
            return max !== null ? Math.min(max, next) : next;
        });
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let next = Number(input.value);
        if (!Number.isFinite(next)) {
            next = this.min();
        }
        next = Math.max(this.min(), next);
        if (this.max() !== null) {
            next = Math.min(this.max()!, next);
        }
        this.value.set(next);
    }
}