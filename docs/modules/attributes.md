# Модуль «Характеристики» (attributes)

Справочник характеристик товаров: название, флаги отображения и фильтра, а также список значений характеристики.

## Расположение

```
src/app/components/modules/attributes/
├── attributes-listing/        # таблица-список характеристик
│   ├── attributes-listing.ts
│   └── attributes-listing.html
├── attributes-editor/         # попап создания/редактирования (2 таба)
│   ├── attributes-editor.ts
│   └── attributes-editor.html
└── attribute-values-tab/      # таб «Значения»
    ├── attribute-values-tab.ts
    ├── attribute-values-tab.html
    └── attribute-values-tab.scss
```

## Маршрут

| Путь                  | Компонент                    |
| --------------------- | ---------------------------- |
| `/catalog/attributes` | `AttributesListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Каталог → Характеристики» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `AttributesListingComponent`

Селектор `app-attributes-listing`. Таблица на базе `ListingComponent`.

- **Колонки:** `id`, `title`, `is_display` (`type: 'boolean'`, подписи «Да»/«Нет»), `is_filter` (`type: 'boolean'`).
- **Состояние (signals):** `attributes: AttributeShortModel[]`, `loading`, `meta`, `pageSize` (50), `page` (1).
- **Приватные поля:** `currentSearch`, `currentSort`, `currentDirection`.
- **Методы:** `loadAttributes()`, `onRowClick()`, `onEdit()`, `onDelete()`, `createClick()`, `onSearch()`, `onSort()`, `onPageChange()`.
- **Открытие едитора:** `PopupService.open('Создание характеристики' | 'Редактирование характеристики', AttributesEditorComponent, { id }, 'with-tabs')`; после закрытия листинг перезагружается.
- **Удаление:** подтверждение через `ConfirmService`, затем `AttributeService.delete()`.

### `AttributesEditorComponent`

Селектор `app-attributes-editor`. Едитор в попапе с классом `with-tabs`.

- **Вход:** `id: number | null` — при наличии включает режим редактирования и грузит данные через `AttributeService.show(id)`.
- **Табы:** `info` («Информация») и `values` («Значения» со счётчиком `values().length`).
- **Модели полей:** `guid`, `title`, `isDisplay`, `isFilter`.
- **Состояние (signals):** `isEditMode`, `loading`, `saving`, `tab`, `values: AttributeValuesStoreModel[]`.
- **Методы:** `loadAttribute()`, `onSave()`, `onCancel()`, `isActiveTab()`, `changeTab()`.
- **Сохранение:** собирает `Partial<AttributeStoreModel>` (`guid`, `title`, `is_display`, `is_filter`, `values`) и вызывает `create()` или `update()`; после успеха — `PopupService.resolve()`.

### `AttributeValuesTabComponent`

Селектор `app-attribute-values-tab`. Управление списком значений характеристики.

- **Модели:** `values = model.required<AttributeValuesStoreModel[]>()`, `newValue = model<string>('')`.
- **Методы:** `addValue()` (добавляет `{ id: null, value }`), `deleteValue(index)`, `onValueBlur(index, value)` (коммит переименования по blur), приватный `updateValue()`.
- **Особенность:** новое значение создаётся с `id: null` — бэкенд создаёт запись, существующие значения приходят с реальным `id`.

## Модели

| Модель                      | Файл                                                               |
| --------------------------- | ------------------------------------------------------------------ |
| `AttributeShortModel`       | `src/app/models/attributes/attribute-short.model.ts`               |
| `AttributeFullModel`        | `src/app/models/attributes/attribute-full.model.ts`                |
| `AttributeStoreModel`       | `src/app/models/attributes/attribute-store.model.ts`               |
| `AttributeValueModel`       | `src/app/models/attributes/attribute-value.model.ts`               |
| `AttributeValuesStoreModel` | `src/app/models/attributes/attribute-values-store.model.ts`        |
| `AttributeIndexParams`      | `src/app/models/params/attribute-index.params.ts`                  |
| `AttributesIndexResponse`   | `src/app/models/responses/attributes/attributes-index.response.ts` |
| `AttributesShowResponse`    | `src/app/models/responses/attributes/attributes-show.response.ts`  |

```ts
interface AttributeShortModel {
    id: number;
    guid: string;
    title: string;
    is_display: boolean;
    is_filter: boolean;
    created_at: string;
    updated_at: string;
}

interface AttributeValuesStoreModel {
    id: number | null;
    value: string;
}
```

## Сервис

`AttributeService` (`src/app/services/attribute.service.ts`), базовый путь `/attributes/`.

| Метод    | HTTP   | Путь               |
| -------- | ------ | ------------------ |
| `index`  | GET    | `/attributes/`     |
| `show`   | GET    | `/attributes/{id}` |
| `create` | POST   | `/attributes/`     |
| `update` | PUT    | `/attributes/{id}` |
| `delete` | DELETE | `/attributes/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.
- `create` / `update` возвращают `AttributeShortModel`.

## Зависимости

- `ListingComponent` — таблица-листинг.
- `InputFieldComponent`, `CheckboxFieldComponent` — поля формы.
- `SkeletonComponent` — состояние загрузки.
- `PopupService`, `ConfirmService`, `NotificationService`.

## Где используется

- `ProductsFiltersAttributesComponent` (`products-filters-attributes`) — фильтр товаров по характеристикам: грузит значения через `AttributeService.show(id)`.
- `AutocompleteAttributesValuesFieldComponent` — автокомплит «характеристика + значение» в едиторе товара.
