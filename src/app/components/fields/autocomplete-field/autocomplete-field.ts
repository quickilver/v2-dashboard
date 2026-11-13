import {
    Directive,
    ElementRef,
    OnDestroy,
    Signal,
    computed,
    inject,
    input,
    model,
    signal,
} from '@angular/core';

/**
 * База для автокомплитов: поиск с debounce, клавиатурная навигация,
 * закрытие по клику вне компонента.
 *
 * Наследник задаёт `filteredItems`, `fetchItems()` и `selectItem()`.
 */
@Directive({
    host: {
        '(document:click)': 'onDocumentClick($event)',
    },
})
export abstract class AutocompleteBaseComponent<T> implements OnDestroy {
    protected readonly elementRef = inject(ElementRef<HTMLElement>);

    label = input<string>('');
    placeholder = input<string>('');
    loadingText = input<string>('Загрузка...');
    emptyText = input<string>('Ничего не найдено');

    /** Показывать чип выбранного элемента вместо инпута. */
    showSelected = input<boolean>(true);

    search = model<string>('');

    readonly isOpen = signal<boolean>(false);
    readonly loading = signal<boolean>(false);
    readonly activeIndex = signal<number>(-1);
    readonly items = signal<T[]>([]);

    /** Задержка перед запросом к API в миллисекундах. */
    protected readonly debounceMs: number = 0;

    /** Отфильтрованные варианты для выпадающего списка. */
    abstract readonly filteredItems: Signal<T[]>;

    /** Подпись выбранного элемента; пустая строка — показывать инпут. */
    readonly selectedLabel: Signal<string> = computed<string>(() => '');

    private searchTimer: ReturnType<typeof setTimeout> | null = null;

    /** Загружает варианты по запросу. */
    protected abstract fetchItems(query: string): Promise<T[]>;

    /** Обрабатывает выбор варианта. */
    abstract selectItem(item: T): void;

    /** Сбрасывает выбранный элемент. */
    clearSelection(): void {
        this.search.set('');
        this.items.set([]);
        this.close();
    }

    ngOnDestroy(): void {
        this.clearTimer();
    }

    onInput(event: Event): void {
        const query: string = (event.target as HTMLInputElement).value;

        this.search.set(query);
        this.activeIndex.set(-1);
        this.clearTimer();

        if (query.trim().length === 0) {
            this.items.set([]);
            this.isOpen.set(false);

            return;
        }

        this.isOpen.set(true);

        if (this.debounceMs > 0) {
            this.searchTimer = setTimeout(() => {
                this.loadItems(query);
            }, this.debounceMs);

            return;
        }

        this.loadItems(query);
    }

    onKeydown(event: KeyboardEvent): void {
        const options: T[] = this.filteredItems();

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextIndex: number = this.activeIndex() + 1;
            this.activeIndex.set(nextIndex >= options.length ? 0 : nextIndex);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const previousIndex: number = this.activeIndex() - 1;
            this.activeIndex.set(previousIndex < 0 ? options.length - 1 : previousIndex);
        } else if (event.key === 'Enter' && this.activeIndex() >= 0) {
            event.preventDefault();
            this.selectItem(options[this.activeIndex()]);
        } else if (event.key === 'Escape') {
            this.close();
        }
    }

    close(): void {
        this.isOpen.set(false);
        this.activeIndex.set(-1);
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

    private async loadItems(query: string): Promise<void> {
        this.loading.set(true);

        try {
            this.items.set(await this.fetchItems(query));
        } catch {
            this.items.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    private clearTimer(): void {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }
    }
}
