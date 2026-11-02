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
│   ├── fields/            # поля форм (16 компонентов)
│   ├── categories-tree/   # дерево категорий (selectable/editable/multiple)
│   ├── popup/             # app-popup + PopupService
│   ├── confirm/           # app-confirm + ConfirmService
│   ├── notification/      # app-notification + NotificationService
│   ├── skeleton/          # app-skeleton — заглушка загрузки
│   ├── file-manager/      # файловый менеджер
│   ├── icon/              # app-icon (SVG из assets/icons)
│   ├── user-info/         # блок пользователя в sidebar
│   └── modules/           # 12 модулей админки
├── pages/                 # login, homepage
├── services/              # 20 сервисов (по одному на сущность + инфраструктурные)
├── models/                # интерфейсы: *.model.ts, params/, responses/
└── interceptors/          # auth.interceptor.ts
```

## 4. Модули

| Модуль         | Маршрут                         | Документация                             |
| -------------- | ------------------------------- | ---------------------------------------- |
| Товары         | `/catalog`, `/catalog/products` | [products.md](./modules/products.md)     |
| Категории      | `/catalog/categories`           | [categories.md](./modules/categories.md) |
| Характеристики | `/catalog/attributes`           | [attributes.md](./modules/attributes.md) |
| Склады         | `/catalog/stores`               | [stores.md](./modules/stores.md)         |
| Цены           | `/catalog/prices`               | [prices.md](./modules/prices.md)         |
| Контрагенты    | `/suppliers`                    | [suppliers.md](./modules/suppliers.md)   |
| Поступления    | `/receives`                     | [receives.md](./modules/receives.md)     |
| Статусы        | `/orders/statuses`              | [statuses.md](./modules/statuses.md)     |
| Страницы       | `/content/pages`                | [pages.md](./modules/pages.md)           |
| Менеджеры      | `/users`                        | [users.md](./modules/users.md)           |
| Настройки      | `/settings`                     | [settings.md](./modules/settings.md)     |
| Логи           | `/logs`                         | [logs.md](./modules/logs.md)             |

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

| Вход               | Тип                 | Назначение                    |
| ------------------ | ------------------- | ----------------------------- |
| `columns`          | `ListingColumn[]`   | Описание колонок              |
| `data`             | `any[]`             | Строки                        |
| `loading`          | `boolean`           | Скелетон вместо таблицы       |
| `meta`             | `MetaModel \| null` | Пагинация                     |
| `pageSize`, `page` | `number`            | Текущая страница              |
| `searchable`       | `boolean`           | Показывать поле поиска        |
| `sortable`         | `boolean`           | Показывать иконки сортировки  |
| `title`            | `string`            | Заголовок                     |
| `actionsColumn`    | `boolean`           | Колонка «Действия» (dropdown) |

| Выход                      | Аргумент             |
| -------------------------- | -------------------- |
| `rowClick`                 | строка               |
| `cellClick`                | `{ row, column }`    |
| `editClick`, `deleteClick` | строка               |
| `createClick`              | —                    |
| `searchChange`             | `string \| number`   |
| `sortChange`               | `{ key, direction }` |
| `pageChange`               | `number`             |

`ListingColumn` (`models/listing.model.ts`):

```ts
interface ListingColumn {
    key: string;
    title: string;
    sortable?: boolean;
    width?: string;
    type?: 'text' | 'boolean' | 'link';
    labels?: { true: string; false: string };
    formatter?: (row: any) => string; // для вложенных объектов
}
```

- `type: 'link'` рендерит `<a class="cell-link">` и **останавливает всплытие** — строка не открывается, срабатывает `cellClick`.
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
| `AutocompleteFieldComponent`                 | `app-autocomplete-field`                   | базовый автокомплит                                                                   |
| `AutocompleteProductsFieldComponent`         | `app-autocomplete-products-field`          | поиск товаров                                                                         |
| `AutocompleteSuppliersFieldComponent`        | `app-autocomplete-suppliers-field`         | поиск контрагентов                                                                    |
| `AutocompleteAttributesFieldComponent`       | `app-autocomplete-attributes-field`        | поиск характеристик                                                                   |
| `AutocompleteAttributesValuesFieldComponent` | `app-autocomplete-attributes-values-field` | характеристика + значение                                                             |
| `CalendarFieldComponent`                     | `app-calendar-field`                       | дата                                                                                  |
| `WyswigFieldComponent`                       | `app-wyswig-field`                         | WYSIWYG-редактор                                                                      |
| `FilePickerFieldComponent`                   | `app-file-picker-field`                    | выбор файла                                                                           |
| `SettingFieldComponent`                      | `app-setting-field`                        | `title`, `type`, `value`, `alias`, `options`                                          |
| `PopupProductFieldComponent`                 | `app-popup-product-field`                  | попап выбора товаров (дерево + таблица)                                               |

Правило: поля работают через `model()` — в шаблоне используется `[(value)]="field"`, `[(checked)]="flag"`.

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
