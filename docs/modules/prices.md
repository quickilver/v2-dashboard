# Модуль «Цены» (prices)

Справочник типов цен (например, «Розничная», «Оптовая»): название и валюта. Типы цен используются в товарах, фильтрах и поступлениях.

## Расположение

```
src/app/components/modules/prices/
├── prices-listing/     # таблица-список типов цен
│   ├── prices-listing.ts
│   └── prices-listing.html
└── prices-editor/      # попап создания/редактирования
    ├── prices-editor.ts
    └── prices-editor.html
```

## Маршрут

| Путь              | Компонент                |
| ----------------- | ------------------------ |
| `/catalog/prices` | `PricesListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Каталог → Цены» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `PricesListingComponent`

Селектор `app-prices-listing`. Таблица на базе `ListingComponent`.

- **Колонки:** `id`, `title`, `currency` (все сортируемые).
- **Состояние (signals):** `prices: PriceModel[]`, `loading`, `meta`, `pageSize` (50), `page` (1).
- **Приватные поля:** `currentSort`, `currentDirection`.
- **Методы:** `loadPrices()`, `onRowClick()`, `onEdit()`, `onDelete()`, `createClick()`, `onSort()`, `onPageChange()`.
- **Особенность:** поиск не используется — `ListingComponent` вызывается без `searchable`, параметр `query` в запрос не передаётся.
- **Открытие едитора:** `PopupService.open('Создание цены' | 'Редактирование цены', PricesEditorComponent, { id })` — без класса `with-tabs`, так как табов нет.

### `PricesEditorComponent`

Селектор `app-prices-editor`. Попап создания/редактирования типа цены.

- **Вход:** `id: number | null`.
- **Модели полей:** `guid`, `title`, `currency`.
- **Состояние (signals):** `isEditMode`, `loading`, `saving`.
- **Методы:** `loadPrice()`, `onSave()`, `onCancel()`.
- **Сохранение:** `Partial<PriceModel>` (`guid`, `title`, `currency`) → `create()` / `update()` → `PopupService.resolve()`.

## Модели

| Модель                | Файл                                                       |
| --------------------- | ---------------------------------------------------------- |
| `PriceModel`          | `src/app/models/price.model.ts`                            |
| `PriceIndexParams`    | `src/app/models/params/price-index.params.ts`              |
| `PricesIndexResponse` | `src/app/models/responses/prices/prices-index.response.ts` |
| `PricesShowResponse`  | `src/app/models/responses/prices/prices-show.response.ts`  |

```ts
interface PriceModel {
    id: number;
    guid: string;
    title: string;
    currency: string;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`PriceService` (`src/app/services/price.service.ts`), базовый путь `/prices/`.

| Метод    | HTTP   | Путь           |
| -------- | ------ | -------------- |
| `index`  | GET    | `/prices/`     |
| `show`   | GET    | `/prices/{id}` |
| `create` | POST   | `/prices/`     |
| `update` | PUT    | `/prices/{id}` |
| `delete` | DELETE | `/prices/{id}` |

- **Query (index):** `page`, `per_page`, `sort`, `direction`.

## Зависимости

- `ListingComponent`, `InputFieldComponent`, `SkeletonComponent`.
- `PopupService`, `ConfirmService`, `NotificationService`.

## Где используется

- `ProductsEditorComponent` — таб «Цены»: ввод суммы по каждому типу цены.
- `ProductsFiltersComponent` — фильтр по диапазону цен.
- `ReceiveFormComponent` — селект «Цена» в поступлении (определяет, какую цену товара обновлять).
