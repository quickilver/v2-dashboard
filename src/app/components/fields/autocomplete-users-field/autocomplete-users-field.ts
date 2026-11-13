import { ChangeDetectionStrategy, Component, Signal, computed, inject, model } from '@angular/core';
import { AutocompleteBaseComponent } from '../autocomplete-field/autocomplete-field';
import { UserService } from '../../../services/user.service';
import { UserShort } from '../../../models/users/user-short.model';

/**
 * Автокомплит пользователя: после выбора инпут скрывается,
 * вместо него показывается чип с выбранной записью.
 */
@Component({
    selector: 'app-autocomplete-users-field',
    standalone: true,
    imports: [],
    templateUrl: './autocomplete-users-field.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteUsersFieldComponent extends AutocompleteBaseComponent<UserShort> {
    private readonly userService = inject(UserService);

    value = model<UserShort | null>(null);

    readonly filteredItems: Signal<UserShort[]> = computed<UserShort[]>(() => {
        const query: string = this.search().toLowerCase().trim();

        if (!query) {
            return [];
        }

        return this.items().filter((user) => user.name.toLowerCase().includes(query));
    });

    override readonly selectedLabel: Signal<string> = computed<string>(
        () => this.value()?.name ?? '',
    );

    selectItem(user: UserShort): void {
        this.value.set(user);
        this.search.set('');
        this.items.set([]);
        this.close();
    }

    override clearSelection(): void {
        this.value.set(null);
        super.clearSelection();
    }

    protected async fetchItems(query: string): Promise<UserShort[]> {
        const response = await this.userService.index({ query, per_page: 10 });

        return response.data;
    }
}
