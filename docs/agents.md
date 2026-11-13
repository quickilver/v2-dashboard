# Документация для нейроагентов

Практическое руководство по работе с репозиторием `v2-dashboard` для AI-агентов и новых разработчиков. Дополняет [AGENTS.md](../AGENTS.md) (краткие правила) и [docs/api.md](./api.md) (эндпоинты).

## 1. Что это за проект

Админ-панель интернет-магазина на Angular 21 (standalone, signals, SSR). Работает в паре с Laravel API (`v2-api`). Каждый раздел админки — отдельный «модуль» в `src/app/components/modules/`, состоящий из листинга (таблица) и едитора (попап с формой).

## 2. Быстрая навигация

| Что нужно                               | Куда смотреть                                                          |
| --------------------------------------- | ---------------------------------------------------------------------- |
| Правила кода и стек                     | [AGENTS.md](../AGENTS.md)                                              |
| Эндпоинты, авторизация, query-параметры | [docs/api.md](./api.md)                                                |
| Конкретный модуль                       | [docs/modules/](./modules/)                                            |
| Страницы верхнего уровня                | [docs/pages/](./pages/)                                                |
| Маршруты                                | `src/app/app.routes.ts`                                                |
| Пункты меню                             | `ModuleSeeder` на бэкенде (`v2-api/database/seeders/ModuleSeeder.php`) |
| Переиспользуемая таблица                | `src/app/components/listing/listing.ts`                                |
| Поля форм                               | `src/app/components/fields/`                                           |
| Сервисы данных                          | `src/app/services/`                                                    |
| Модели и типы                           | `src/app/models/`                                                      |

## 3. Карта слоёв

```
src/app/
├── app.ts / app.config.ts / app.routes.ts   # корень, провайдеры, маршруты
├── components/
│   ├── layout/            # каркас: sidebar + router-outlet
│   ├── navigation/        # меню из ModuleService
│   ├── listing/           # app-listing — универсальная таблица
│   ├── fields/            # поля форм (20 компонентов)
│   ├── categories-tree/   # дерево категорий (selectable/editable/multiple)
│   ├── section-page/      # лендинг раздела: карточки подразделов
│   ├── popup/             # app-popup + PopupService
│   ├── confirm/           # app-confirm + ConfirmService
│   ├── notification/      # app-notification + NotificationService
│   ├── skeleton/          # app-skeleton — заглушка загрузки
│   ├── file-manager/      # файловый менеджер
│   ├── icon/              # app-icon (SVG из assets/icons)
│   ├── user-info/         # блок пользователя в sidebar
│   └── modules/           # 16 модулей админки
├── pages/                 # login, homepage, catalog, purchasing, content
├── services/              # 28 сервисов (по одному на сущность + инфраструктурные)
├── models/                # интерфейсы: *.model.ts, params/, responses/
├── helpers/               # mask.helper, phone.helper, price.helper, order-products.helper
└── interceptors/          # auth.interceptor.ts
```

## 4. Модули

| Модуль         | Маршрут               | Документация                             |
| -------------- | --------------------- | ---------------------------------------- |
| Каталог        | `/catalog`            | [catalog.md](./modules/catalog.md)       |
| Товары         | `/catalog/products`   | [products.md](./modules/products.md)     |
| Категории      | `/catalog/categories` | [categories.md](./modules/categories.md) |
| Характеристики | `/catalog/attributes` | [attributes.md](./modules/attributes.md) |
| Склады         | `/catalog/stores`     | [stores.md](./modules/stores.md)         |
| Цены           | `/catalog/prices`     | [prices.md](./modules/prices.md)         |
| Закупка        | `/purchasing`         | [purchasing.md](./modules/purchasing.md) |
| Контрагенты    | `/suppliers`          | [suppliers.md](./modules/suppliers.md)   |
| Поступления    | `/receives`           | [receives.md](./modules/receives.md)     |
| Заказы         | `/orders`             | [orders.md](./modules/orders.md)         |
| Статусы        | `/orders/statuses`    | [statuses.md](./modules/statuses.md)     |
| Клиенты        | `/accounts`           | [accounts.md](./modules/accounts.md)     |
| Контент        | `/content`            | [content.md](./modules/content.md)       |
| Страницы       | `/content/pages`      | [pages.md](./modules/pages.md)           |
| Менеджеры      | `/team/users`         | [users.md](./modules/users.md)           |
| Задачи         | `/team/tasks`         | [tasks.md](./modules/tasks.md)           |
| Отчёты         | `/reports`            | [reports.md](./modules/reports.md)       |
| Настройки      | `/settings`           | [settings.md](./modules/settings.md)     |
| Логи           | `/logs`               | [logs.md](./modules/logs.md)             |
| Бэкапы         | `/backups`            | [backups.md](./modules/backups.md)       |

## 5. Канонический модуль: анатомия

Почти все модули повторяют одну структуру. Эталон — `suppliers` (простой) и `products` (сложный).

```
modules/<entity>/
├── <entity>-listing/
│   ├── <entity>-listing.ts      # Component, OnInit, signals
│   ├── <entity>-listing.html    # <app-listing ... />
│   └── <entity>-listing.scss    # опционально
└── <entity>-editor/
    ├── <entity>-editor.ts       # input id, models, onSave/onCancel
    ├── <entity>-editor.html     # tabs + editor-form + editor-actions
    └── <entity>-editor.scss     # опционально
```

### Листинг — обязательный каркас

```ts
@Component({
    selector: 'app-<entity>-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './<entity>-listing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <Entity>ListingComponent implements OnInit {
    private readonly <entity>Service = inject(<Entity>Service);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    columns = signal<ListingColumn[]>([...]);
    items = signal<Model[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    ngOnInit(): void { this.load(); }
    // load / onRowClick / onEdit / onDelete / createClick / onSearch / onSort / onPageChange
}
```

Шаблон листинга:

```html
<app-listing
    [columns]="columns()"
    [data]="items()"
    [loading]="loading()"
    [meta]="meta()"
    [pageSize]="pageSize()"
    [page]="page()"
    title="Название раздела"
    [actionsColumn]="true"
    (rowClick)="onRowClick($event)"
    (sortChange)="onSort($event)"
    (pageChange)="onPageChange($event)"
    (editClick)="onEdit($event)"
    (deleteClick)="onDelete($event)"
    (createClick)="createClick()"
/>
```

### Едитор — обязательный каркас

```ts
export class <Entity>EditorComponent implements OnInit {
    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    title = model<string>('');

    ngOnInit(): void {
        const entityId = this.id();
        if (entityId) {
            this.isEditMode.set(true);
            this.load(entityId);
        }
    }

    async onSave(): Promise<void> { /* create | update → popupService.resolve() */ }
    onCancel(): void { this.popupService.resolve(); }
    isActiveTab(tab: string): boolean { return this.tab() === tab; }
    changeTab(tab: string): void { this.tab.set(tab); }
}
```

Шаблон едитора (с табами):

```html
<div class="editor-container">
    @if (loading()) {
    <div class="editor-loading">
        <app-skeleton [count]="5" width="100%" [height]="36" [gap]="12" />
    </div>
    } @else {
    <div class="tabs">
        <div [class.is-active]="isActiveTab('info')" (click)="changeTab('info')">Информация</div>
    </div>
    <div class="editor-form">
        @if (isActiveTab('info')) {
        <div class="editor-body"><!-- поля --></div>
        }
    </div>
    <div class="editor-actions">
        <button (click)="onCancel()">Отмена</button>
        <button class="primary" (click)="onSave()" [disabled]="saving()">
            {{ saving() ? 'Сохранение...' : isEditMode() ? 'Сохранить' : 'Создать' }}
        </button>
    </div>
    }
</div>
```

## 6. Чек-лист: добавить новый модуль

1. **Бэкенд (`v2-api`)** — модель, миграция, `Request`, `Resource`, контроллер, `Route::apiResource`, пункт в `ModuleSeeder`.
2. **Модели фронта** — `src/app/models/<entity>.model.ts`, `params/<entity>-index.params.ts`, `responses/<entity>/<entity>-index.response.ts` (+ `show`, `create`, `update`).
3. **Сервис** — `src/app/services/<entity>.service.ts` с `index` / `show` / `create` / `update` / `delete` через `firstValueFrom`.
4. **Листинг** — `modules/<entity>/<entity>-listing/`.
5. **Едитор** — `modules/<entity>/<entity>-editor/`.
6. **Маршрут** — добавить в `src/app/app.routes.ts`.
7. **Документация** — `docs/modules/<entity>.md` + раздел в `docs/api.md`.
8. **Проверки** — `npm run build`, `npx prettier --check`, `problems`.

## 7. Переиспользуемые компоненты

### `app-listing` (`components/listing/listing.ts`)

| Вход                | Тип                 | Назначение                                   |
| ------------------- | ------------------- | -------------------------------------------- |
| `columns`           | `ListingColumn[]`   | Описание колонок                             |
| `availableColumns`  | `ListingColumn[]`   | Полный список колонок для настроек видимости |
| `columnsStorageKey` | `string`            | Ключ `localStorage` для колонок и размера    |
| `data`              | `any[]`             | Строки                                       |
| `loading`           | `boolean`           | Скелетон вместо таблицы                      |
| `meta`              | `MetaModel \| null` | Пагинация                                    |
| `pageSize`, `page`  | `number`            | Размер страницы и текущая страница           |
| `searchable`        | `boolean`           | Показывать поле поиска                       |
| `searchPlaceholder` | `string`            | Плейсхолдер поиска (по умолчанию «Поиск»)    |
| `sortable`          | `boolean`           | Показывать иконки сортировки                 |
| `title`             | `string`            | Заголовок                                    |
| `actionsColumn`     | `boolean`           | Колонка «Действия» (dropdown)                |
| `sizable`           | `boolean`           | Кнопка «Размеры» (крупный/обычный/мелкий)    |

| Выход                      | Аргумент             |
| -------------------------- | -------------------- |
| `rowClick`                 | строка               |
| `cellClick`                | `{ row, column }`    |
| `editClick`, `deleteClick` | строка               |
| `createClick`              | —                    |
| `searchChange`             | `string \| number`   |
| `sortChange`               | `{ key, direction }` |
| `pageChange`               | `number`             |

### Размер таблицы (кнопка «Размеры»)

Кнопка выводится только при `[sizable]="true"` (сейчас — в модуле «Характеристики»).
Варианты: `large` (16 px / 16 px), `normal` (14 px / 10 px, по умолчанию), `small` (12 px / 5 px).
Размер применяется классом на контейнере `.table` (`size-large` / `size-normal` / `size-small`),
CSS правит `font-size` и вертикальные `padding` ячеек. Выбор хранится в `localStorage`
по ключу `listing_size:{columnsStorageKey}` через `ListingSizesService`.

```html
<app-listing ... [sizable]="true" />
```

`ListingColumn` (`models/listing.model.ts`):

```ts
interface ListingColumn {
    key: string;
    title: string;
    sortable?: boolean;
    width?: string;
    type?: 'text' | 'boolean' | 'link' | 'image';
    labels?: { true: string; false: string };
    isDefault?: boolean; // колонка видима по умолчанию
    formatter?: (row: any) => string; // для вложенных объектов
    imageUrl?: (row: any) => string; // источник картинки для type: 'image'
}
```

- `type: 'link'` рендерит `<a class="cell-link">` и **останавливает всплытие** — строка не открывается, срабатывает `cellClick`.
- `type: 'image'` рендерит `<img>` с `src` из `imageUrl(row)` (или из значения поля).
- `formatter` позволяет хранить в строке объекты (например, `supplier: SupplierModel`) и выводить `row.supplier?.title`.

### Поля форм (`components/fields/`)

| Компонент                                    | Селектор                                   | Ключевые входы                                                                        |
| -------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `InputFieldComponent`                        | `app-input-field`                          | `label`, `placeholder`, `type`, `value`, `readonly`, `size` (`small`/`regular`/`big`) |
| `TextareaFieldComponent`                     | `app-textarea-field`                       | `label`, `placeholder`, `rows`, `value`                                               |
| `CheckboxFieldComponent`                     | `app-checkbox-field`                       | `label`, `checked`                                                                    |
| `CounterFieldComponent`                      | `app-counter-field`                        | `value`, `min`, `max`, `editable`, `size`                                             |
| `SelectFieldComponent`                       | `app-select-field`                         | `label`, `placeholder`, `options: SelectOption[]`, `disabled`, `value`                |
| `DropdownFieldComponent`                     | `app-dropdown-field`                       | `label`, `options: DropdownOption[]`                                                  |
| `AutocompleteBaseComponent`                  | —                                          | абстрактная база автокомплитов (`filteredItems`, `fetchItems`, `selectItem`)          |
| `AutocompleteProductsFieldComponent`         | `app-autocomplete-products-field`          | поиск товаров                                                                         |
| `AutocompleteSuppliersFieldComponent`        | `app-autocomplete-suppliers-field`         | поиск контрагентов                                                                    |
| `AutocompleteAttributesFieldComponent`       | `app-autocomplete-attributes-field`        | поиск характеристик                                                                   |
| `AutocompleteAccountsFieldComponent`         | `app-autocomplete-accounts-field`          | поиск клиентов (`search`, `value: AccountModel \| null`)                              |
| `AutocompleteUsersFieldComponent`            | `app-autocomplete-users-field`             | поиск пользователей (`search`, `value: UserShort \| null`), чип после выбора          |
| `AutocompleteAttributesValuesFieldComponent` | `app-autocomplete-attributes-values-field` | характеристика + значение                                                             |
| `ProductsListFieldComponent`                 | `app-products-list-field`                  | поиск товаров + попап каталога (`searchLabel`, `productSelected`)                     |
| `CalendarFieldComponent`                     | `app-calendar-field`                       | дата (`DD.MM.YYYY`)                                                                   |
| `WyswigFieldComponent`                       | `app-wyswig-field`                         | WYSIWYG-редактор                                                                      |
| `FilePickerFieldComponent`                   | `app-file-picker-field`                    | выбор файла                                                                           |
| `SettingFieldComponent`                      | `app-setting-field`                        | `title`, `type` (`text`/`checkbox`/`select`), `value`, `alias`, `options`             |
| `PopupProductFieldComponent`                 | `app-popup-product-field`                  | попап выбора товаров (дерево + таблица)                                               |
| `TabsFieldComponent`                         | `app-tabs-field`                           | `label`, `options: TabsFieldOption[]`, `value`, `fullWidth`, `small`                  |

Правило: поля работают через `model()` — в шаблоне используется `[(value)]="field"`, `[(checked)]="flag"`.

Правило: выпадающие списки (`app-autocomplete-*`, `app-calendar-field`) закрываются
по клику вне компонента — через `host: { '(document:click)': 'onDocumentClick($event)' }`
и проверку `elementRef.nativeElement.contains(target)`. `mouseleave` не используется.

### `app-skeleton` (`components/skeleton/skeleton.ts`)

| Вход     | Тип                | По умолчанию | Назначение                                  |
| -------- | ------------------ | ------------ | ------------------------------------------- |
| `width`  | `number \| string` | `'100%'`     | Ширина блока                                |
| `height` | `number \| string` | `16`         | Высота блока                                |
| `count`  | `number`           | `1`          | Количество строк                            |
| `radius` | `number`           | `4`          | Скругление                                  |
| `gap`    | `number`           | `8`          | Отступ между строками                       |
| `circle` | `boolean`          | `false`      | Круглая форма (аватар)                      |
| `dark`   | `boolean`          | `false`      | Тёмный вариант — для белых/светлых подложек |

```html
<app-skeleton [count]="3" width="280px" [height]="120" [gap]="20" [dark]="true" />
```

### Инфраструктурные сервисы

| Сервис                | Назначение                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `PopupService`        | `open<T>(title, component, inputs?, dialogClass?)` → `Promise<T \| undefined>`; `resolve(result?)` закрывает верхний попап |
| `ConfirmService`      | `confirm(title, description, confirmLabel?, cancelLabel?)` → `Promise<boolean>`                                            |
| `NotificationService` | `success` / `error` / `info` / `warning` (автоскрытие 10 с)                                                                |
| `AuthService`         | токен, логин                                                                                                               |
| `ModuleService`       | список модулей для меню и прав                                                                                             |

Класс попапа `'with-tabs'` включает flex-раскладку: табы сверху, скроллируемое тело, «прилипшие» кнопки снизу. **Обязателен**, если в едиторе есть табы.

## 8. Соглашения кода

- `standalone: true`, `ChangeDetectionStrategy.OnPush` — всегда.
- `inject()` вместо конструктора (кроме `HttpClient` в сервисах — там конструктор).
- Состояние — `signal` / `computed`; двусторонние поля — `model()`; параметры — `input()`; события — `output()`.
- Все переменные и параметры типизированы, `any` — только в `ListingComponent` и обработке ошибок (`catch (response: any)`).
- Сервисы возвращают `Promise` (`firstValueFrom`), компоненты используют `async/await`.
- Файлы — `kebab-case`, классы — `PascalCase`, селекторы — `app-*`.
- Один интерфейс — один файл (в `models/`).
- Комментарии — только для неочевидных решений.
- Форматирование — Prettier (`npm run refactor`).

## 9. Типовые ошибки и как их избежать

| Симптом                                                                      | Причина                             | Решение                                                      |
| ---------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| `Can't bind to 'x' since it isn't a known property`                          | Компонент не добавлен в `imports`   | Добавить в `imports` компонента                              |
| `Property 'x' does not exist` в шаблоне                                      | Опечатка или поле не объявлено      | Сверить с `.ts`; перезапустить language server               |
| `<select>` не показывает выбранное                                           | `[value]` на `<select>` не работает | Использовать `[selected]` на `<option>` (см. `select-field`) |
| Попап с табами «разъезжается»                                                | Не передан класс `with-tabs`        | `popupService.open(..., 'with-tabs')`                        |
| Строка листинга открывается при клике по ссылке                              | Нет `type: 'link'`                  | Указать `type: 'link'` в колонке                             |
| В ячейке `[object Object]`                                                   | В строке объект без `formatter`     | Добавить `formatter` в колонку                               |
| `array_key_exists(): Argument #1 must be a valid array offset type` (бэкенд) | `HasLog` + составной первичный ключ | Уже исправлено через `HasLog::resolveModelId()`              |
| Laravel-роут `{receife}`                                                     | Автогенерация имени параметра       | `->parameters(['receives' => 'receive'])`                    |

## 10. Команды

```bash
npm start          # ng serve
npm run build      # продакшн-сборка (проверка типов + prerender)
npm run watch      # watch-сборка
npm test           # Vitest
npm run refactor   # Prettier по src/**
npx prettier --check "src/app/**/*.{ts,html,scss}"
```

Сборка выдаёт предупреждение о превышении бюджета бандла (~620 kB при лимите 500 kB) — это **не ошибка**.

## 11. Правила для агентов

1. Перед изменением модуля прочитать его `docs/modules/<entity>.md`.
2. Перед работой с API свериться с `docs/api.md`.
3. Не менять `AGENTS.md` и эту документацию без запроса.
4. Не создавать markdown-файлы «для заметок» — только запрошенную документацию.
5. После правок запускать `npm run build` и `npx prettier --check` по затронутым путям.
6. Не трогать несвязанные модули; исправлять только то, что сломано собственной правкой.
7. При добавлении эндпоинта обновлять `docs/api.md`; при добавлении модуля — `docs/modules/<entity>.md` и таблицу в разделе 4 этого файла.
