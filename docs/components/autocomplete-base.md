# Абстрактная база автокомплитов `AutocompleteBaseComponent`

## Назначение

Общая логика всех автокомплитов: поиск с debounce, состояния загрузки,
клавиатурная навигация и закрытие списка по клику вне компонента.
Наследники задают только источник данных, фильтрацию и обработку выбора.

## Расположение

```
src/app/components/fields/autocomplete-field/
└── autocomplete-field.ts   # AutocompleteBaseComponent<T>
```

Файл не содержит компонента — только `@Directive()`-абстрактный класс
(директива без селектора используется как носитель `host`-биндинга).

## Публичный API

| Член                | Тип                    | Назначение                              |
| ------------------- | ---------------------- | --------------------------------------- |
| `label`             | `input<string>`        | Подпись над полем                       |
| `placeholder`       | `input<string>`        | Плейсхолдер инпута                      |
| `loadingText`       | `input<string>`        | Текст состояния загрузки                |
| `emptyText`         | `input<string>`        | Текст пустого результата                |
| `search`            | `model<string>`        | Текст поиска (`[(search)]`)             |
| `isOpen`            | `signal<boolean>`      | Открыт ли список                        |
| `loading`           | `signal<boolean>`      | Идёт ли запрос                          |
| `activeIndex`       | `signal<number>`       | Индекс активного пункта                 |
| `items`             | `signal<T[]>`          | Загруженные варианты                    |
| `debounceMs`        | `protected number`     | Задержка запроса (по умолчанию `0`)     |
| `filteredItems`     | `abstract Signal<T[]>` | Отфильтрованные варианты для списка     |
| `fetchItems()`      | `protected abstract`   | Загрузка вариантов по запросу           |
| `selectItem()`      | `abstract`             | Обработка выбора                        |
| `onInput()`         | метод                  | Ввод: сброс таймера, debounce, загрузка |
| `onKeydown()`       | метод                  | Стрелки, `Enter`, `Escape`              |
| `close()`           | метод                  | Закрыть список                          |
| `onDocumentClick()` | метод                  | Закрытие по клику вне хоста             |

## Как наследовать

```ts
@Component({
    selector: 'app-autocomplete-users-field',
    standalone: true,
    templateUrl: './autocomplete-users-field.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteUsersFieldComponent extends AutocompleteBaseComponent<UserShort> {
    private readonly userService = inject(UserService);

    value = model<UserShort | null>(null);

    readonly filteredItems: Signal<UserShort[]> = computed(() =>
        this.items().filter((user) =>
            user.name.toLowerCase().includes(this.search().toLowerCase()),
        ),
    );

    selectItem(user: UserShort): void {
        this.value.set(user);
        this.search.set('');
        this.items.set([]);
        this.close();
    }

    protected async fetchItems(query: string): Promise<UserShort[]> {
        const response = await this.userService.index({ query, per_page: 10 });

        return response.data;
    }
}
```

Шаблон использует `filteredItems()`, `selectItem(item)`, `loadingText()`,
`emptyText()`, `isOpen()`, `loading()`, `activeIndex()`.

## Наследники

| Компонент                              | Тип `T`               | Особенности                      |
| -------------------------------------- | --------------------- | -------------------------------- |
| `AutocompleteAccountsFieldComponent`   | `AccountModel`        | имя из ФИО                       |
| `AutocompleteSuppliersFieldComponent`  | `SupplierModel`       | поиск по `title`                 |
| `AutocompleteProductsFieldComponent`   | `ProductIndex`        | поиск по `title` и `sku`         |
| `AutocompleteAttributesFieldComponent` | `AttributeShortModel` | `debounceMs = 300`, `excludeIds` |
| `AutocompleteUsersFieldComponent`      | `UserShort`           | чип выбранного пользователя      |

## Известные ограничения

- `AutocompleteAttributesValuesFieldComponent` (характеристика + значение)
  не наследует базу: у него два независимых списка в одном компоненте.
- Debounce задаётся полем `debounceMs`, а не входом — менять только в наследнике.

## Стили

Общие стили автокомплитов вынесены в `src/styles/_fields.scss`:

- `.autocomplete-wrapper` — `position: relative`, инпут на всю ширину;
- `.autocomplete-menu` — абсолютное позиционирование под инпутом, рамка, тень,
  `max-height: 240px`, скролл;
- `.autocomplete-item` — паддинги, hover/active, модификатор `--info`.

Компонентные SCSS содержат только отличия (например, `.product-title` /
`.product-sku` у товаров, чип у пользователей).
