import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TabsFieldComponent, TabsFieldOption } from '../../components/fields/tabs-field/tabs-field';
import { IconComponent } from '../../components/icon/icon';

@Component({
    selector: 'app-reports-page',
    standalone: true,
    imports: [TabsFieldComponent, RouterLink, IconComponent],
    templateUrl: './reports.html',
    styleUrl: './reports.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent {
    readonly tabs: TabsFieldOption[] = [
        { label: 'Продажи', value: 'sales' },
        { label: 'Закупки', value: 'purchases' },
        { label: 'Склад', value: 'stock' },
        { label: 'Клиенты', value: 'customers' },
    ];

    readonly activeTab = signal<string | number | null>('sales');
}
