# Модуль «Товары» (products)

Каталог товаров: листинг с расширенными фильтрами и едитор с табами (информация, описание, категории, цены, остатки, характеристики, медиа).

## Расположение

```
src/app/components/modules/products/
├── products-listing/              # страница листинга + фильтры
│   ├── products-listing.ts
│   ├── products-listing.html
│   └── products-listing.scss
├── products-filters/              # панель фильтров
│   ├── products-filters.ts
│   ├── products-filters.html
│   └── products-filters.scss
├── products-filters-attributes/   # фильтр по характеристикам
│   ├── products-filters-attributes.ts
│   ├── products-filters-attributes.html
│   └── products-filters-attributes.scss
├── products-editor/               # попап создания/редактирования (7 табов)
│   ├── products-editor.ts
│   ├── products-editor.html
│   └── products-editor.scss
└── products-editor-attributes/    # таб «Характеристики»
    ├── products-editor-attributes.ts
    ├── products-editor-attributes.html
    └── products-editor-attributes.scss
```

## Маршруты

| Путь                | Компонент                  |
| ------------------- | -------------------------- |
| `/catalog`          | `ProductsListingComponent` |
| `/catalog/products` | `ProductsListingComponent` |

Определены в `src/app/app.routes.ts`. Пункт меню «Каталог → Товары» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `ProductsListingComponent`

Селектор `app-products-listing`. Листинг на базе `ListingComponent` + панель фильтров слева.

- **Колонки:** `id`, `title`, `sku` (все сортируемые).
- **Состояние (signals):** `products: ProductIndex[]`, `loading`, `meta`, `pageSize` (50), `page` (1), `filters: ProductFilters`.
- **Приватные поля:** `currentSearch`, `currentSort`, `currentDirection`.
- **Методы:** `loadProducts()`, `onRowClick()`, `onEdit()`, `onDelete()`, `createClick()`, `onSearch()`, `onFiltersChange()`, `onSort()`, `onPageChange()`.
- **Особенности:**
    - `[searchable]="false"` — поиск вынесен в панель фильтров;
    - едитор открывается с классом `with-tabs`;
    - удаление пока не реализовано: `onDelete()` показывает `NotificationService.info('Удаление товаров пока не реализовано')`.

### `ProductsFiltersComponent`

Селектор `app-products-filters`. Панель фильтров с раскрывающимися группами.

- **Модель:** `filters = model<ProductFilters>()`.
- **Состояние:** `stores`, `prices`, `expandedGroups` (`categories` открыта по умолчанию).
- **Computed:** `categoriesCount`, `storesCount`, `pricesCount`.
- **Методы:** `toggleGroup()`, `isExpanded()`, `onQueryChange()`, `onCategoriesChange()`, `onStoreToggle()`, `onPriceRangeChange()`, `getPriceFilter()`, `isStoreSelected()`, `onAttributesChange()`, `reset()`.
- **Группы фильтров:**
    - поиск по названию/артикулу/описанию (`app-input-field`);
    - категории (`app-categories-tree`, `selectable`, `multiple`);
    - склады (чекбоксы, список из `StoreService.index({ per_page: 100 })`);
    - цены (диапазон «от — до» по каждому типу цены, список из `PriceService.index({ per_page: 100 })`);
    - характеристики (`app-products-filters-attributes`).

### `ProductsFiltersAttributesComponent`

Селектор `app-products-filters-attributes`. Фильтр по характеристикам и их значениям.

- **Модель:** `value = model<ProductAttributeFilter[]>()`.
- **Состояние:** `expanded`, `expandedGroups`, `titles`, `values`, `loadingValues`.
- **Computed:** `count`, `selectedIds`, `filters` (view-модели с названием, значениями и выбранными id).
- **Методы:** `toggle()`, `isExpanded()`, `toggleGroup()`, `select()` (добавляет характеристику и грузит значения через `AttributeService.show()`), `isValueSelected()`, `onValueToggle()`, `remove()`.

### `ProductsEditorComponent`

Селектор `app-products-editor`. Едитор товара в попапе с классом `with-tabs`.

- **Вход:** `id: number | null`.
- **Табы:** `info`, `description`, `categories`, `prices`, `stores`, `attributes`, `media` (в разработке).
- **Модели полей:** `title`, `sku`, `description`, `categories` (`number | number[] | null`).
- **Состояние:** `isEditMode`, `loading`, `saving`, `tab`, `prices`, `stores`, `attributes`, `priceAmounts`, `storeCounts`.
- **Computed:** `pricesCount`, `storesTotal`, `attributesCount`, `categoriesCount`.
- **Методы:** `loadProduct()`, `loadPrices()`, `loadStores()`, `onSave()`, `onCancel()`, `isActiveTab()`, `changeTab()`, `onPriceAmountChange()`, `onStoreCountChange()`, приватный `getCategoryIds()`.
- **Сохранение:** собирает `ProductCreateRequest`:
    - `prices` — только цены с `amount > 0`;
    - `stores` — только склады с `count >= 0`;
    - `attribute_values` — из `attributes`, где заполнено значение; для существующего значения передаётся `{ id, position }`, для нового — `{ attribute_id, value, position }` или `{ attribute_title, value, position }`.

### `ProductsEditorAttributesComponent`

Селектор `app-products-editor-attributes`. Таблица характеристик товара с сортировкой по позиции.

- **Модель:** `attributes = model<ProductAttribute[]>()`.
- **Состояние:** `newAttribute: AttributeFieldValue`.
- **Методы:** `addAttribute()`, `removeAttribute()`, `onPositionEnter()`, `onPositionBlur()`, приватный `commitPosition()`.
- **Особенность:** `suppressPositionBlur` защищает от двойного коммита позиции (Enter + blur).

## Модели

| Модель                         | Файл                                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| `ProductIndex`                 | `src/app/models/products/product-short.model.ts`                   |
| `ProductFull`                  | `src/app/models/products/product-full.model.ts`                    |
| `ProductCreateRequest`         | `src/app/models/products/product-create-request.model.ts`          |
| `ProductPriceRequest`          | `src/app/models/products/product-price-request.model.ts`           |
| `ProductStoreRequest`          | `src/app/models/products/product-store-request.model.ts`           |
| `ProductAttributeValueRequest` | `src/app/models/products/product-attribute-value-request.model.ts` |
| `ProductAttribute`             | `src/app/models/products/product-attribute.model.ts`               |
| `ProductFilters`               | `src/app/models/products/product-filters.model.ts`                 |
| `ProductsIndexResponse`        | `src/app/models/responses/products/products-index.response.ts`     |
| `ProductsShowResponse`         | `src/app/models/responses/products/products-show.response.ts`      |

```ts
interface ProductCreateRequest {
    title: string;
    sku: string;
    description?: string | null;
    categories: number[];
    attribute_values: ProductAttributeValueRequest[];
    prices: ProductPriceRequest[];
    stores: ProductStoreRequest[];
}

interface ProductFilters {
    query: string;
    categories: number[];
    stores: number[];
    prices: ProductPriceFilter[];
    attributes: ProductAttributeFilter[];
}
```

## Сервис

`ProductService` (`src/app/services/product.service.ts`), базовый путь `/products/`.

| Метод    | HTTP | Путь             |
| -------- | ---- | ---------------- |
| `index`  | GET  | `/products/`     |
| `show`   | GET  | `/products/{id}` |
| `create` | POST | `/products/`     |
| `update` | PUT  | `/products/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `categories` (CSV), `stores` (CSV), `prices[i][id|min|max]`, `attributes[i][id]`, `attributes[i][values][j]`.
- `ProductIndexParams` объявлен прямо в файле сервиса (не в `models/params/`).
- Метода `delete` в сервисе нет.

## Зависимости

- `ListingComponent`, `CategoriesTreeComponent`, `SkeletonComponent`.
- `InputFieldComponent`, `CounterFieldComponent`, `WyswigFieldComponent`, `AutocompleteAttributesValuesFieldComponent`.
- `PopupService`, `ConfirmService`, `NotificationService`.
- `PriceService`, `StoreService`, `AttributeService`.

## Известные ограничения

- Удаление товара не реализовано.
- Таб «Медиа» — заглушка «Медиа — в разработке».
