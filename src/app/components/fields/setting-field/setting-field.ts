import { Component, computed, inject, input, model, OnInit, signal } from '@angular/core';
import { InputFieldComponent } from '../input-field/input-field';
import { CheckboxFieldComponent } from '../checkbox-field/checkbox-field';
import { SelectFieldComponent, SelectOption } from '../select-field/select-field';
import { PriceService } from '../../../services/price.service';
import { StatusService } from '../../../services/status.service';

export interface SettingOptions {
    source?: string;
    items?: SelectOption[];
}

@Component({
    selector: 'app-setting-field',
    standalone: true,
    imports: [InputFieldComponent, CheckboxFieldComponent, SelectFieldComponent],
    templateUrl: './setting-field.html',
})
export class SettingFieldComponent implements OnInit {
    private readonly priceService = inject(PriceService);
    private readonly statusService = inject(StatusService);

    title = input<string>('');
    type = input<'text' | 'checkbox' | 'select'>('text');
    value = model<string | number | boolean>('');
    alias = input<string>('');
    options = input<SettingOptions | null>(null);

    selectOptions = signal<SelectOption[]>([]);

    // Derived signal for text input compatibility (string | number only)
    textValue = computed<string | number>(() => {
        const v = this.value();
        return typeof v === 'boolean' ? '' : v;
    });

    selectValue = computed<string | number | null>(() => {
        const v = this.value();

        if (typeof v === 'boolean' || v === '' || v === null || v === undefined) {
            return null;
        }

        return v;
    });

    ngOnInit(): void {
        this.loadOptions();
    }

    private async loadOptions(): Promise<void> {
        const options = this.options();

        if (!options) return;

        if (options.items?.length) {
            this.selectOptions.set(options.items);
            return;
        }

        const loadedOptions = await this.loadOptionsBySource(options.source);

        this.selectOptions.set(loadedOptions);
    }

    /**
     * Загружает опции по имени источника данных.
     */
    private async loadOptionsBySource(source?: string): Promise<SelectOption[]> {
        switch (source) {
            case 'prices':
                return this.loadPriceOptions();
            case 'statuses':
                return this.loadStatusOptions();
            default:
                return [];
        }
    }

    private async loadPriceOptions(): Promise<SelectOption[]> {
        try {
            const response = await this.priceService.index({ per_page: 100 });

            return response.data.map((price) => ({
                label: price.title,
                value: price.id,
            }));
        } catch {
            return [];
        }
    }

    private async loadStatusOptions(): Promise<SelectOption[]> {
        try {
            const response = await this.statusService.index({ per_page: 100 });

            return response.data.map((status) => ({
                label: status.title,
                value: status.id,
            }));
        } catch {
            return [];
        }
    }
}
