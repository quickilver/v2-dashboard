import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { IconComponent } from '../../../icon/icon';
import { AccountFilters } from '../../../../models/accounts/account-filters.model';

@Component({
    selector: 'app-accounts-filters',
    standalone: true,
    imports: [InputFieldComponent, IconComponent],
    templateUrl: './accounts-filters.html',
    styleUrl: './accounts-filters.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsFiltersComponent {
    filters = model<AccountFilters>({
        query: '',
        is_blocked: null,
    });

    expandedGroups = signal<Record<string, boolean>>({
        status: true,
    });

    blockedCount = computed<number>(() => (this.filters().is_blocked === null ? 0 : 1));

    isExpanded(group: string): boolean {
        return this.expandedGroups()[group] ?? false;
    }

    toggleGroup(group: string): void {
        this.expandedGroups.update((groups) => ({
            ...groups,
            [group]: !groups[group],
        }));
    }

    onQueryChange(value: string | number): void {
        this.filters.update((filters) => ({ ...filters, query: String(value) }));
    }

    onBlockedChange(value: boolean | null): void {
        this.filters.update((filters) => ({ ...filters, is_blocked: value }));
    }
}
