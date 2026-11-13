import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { IconComponent } from '../../icon/icon';

export interface TabsFieldOption {
    label: string;
    value: string | number;
    /** Иконка из `assets/icons` (необязательно). */
    icon?: string;
    /** Отключить таб. */
    disabled?: boolean;
}

/**
 * Табы в стиле iOS (segmented control).
 * Работает как поле формы: `[(value)]="tab"`.
 */
@Component({
    selector: 'app-tabs-field',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './tabs-field.html',
    styleUrl: './tabs-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsFieldComponent {
    label = input<string>('');
    options = input<TabsFieldOption[]>([]);
    /** Растянуть табы на всю ширину контейнера. */
    fullWidth = input<boolean>(true);
    /** Компактный размер. */
    small = input<boolean>(false);

    value = model<string | number | null>(null);

    readonly count = computed<number>(() => this.options().length);

    readonly activeIndex = computed<number>(() => {
        const currentValue = this.value();

        return this.options().findIndex((option) => option.value === currentValue);
    });

    /** Сдвиг «бегунка» под активным табом. */
    readonly thumbStyle = computed<Record<string, string>>((): Record<string, string> => {
        const count = this.count();
        const index = this.activeIndex();

        if (count === 0 || index < 0) {
            return { display: 'none' };
        }

        return {
            display: 'block',
            width: `calc((100% - 8px) / ${count})`,
            transform: `translateX(calc(${index} * 100%))`,
        };
    });

    select(option: TabsFieldOption): void {
        if (option.disabled) {
            return;
        }

        this.value.set(option.value);
    }
}
