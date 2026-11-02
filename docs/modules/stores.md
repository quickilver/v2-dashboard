# Модуль «Склады» (stores)

Справочник складов (магазинов): название, адрес, флаг отображения. Остатки товаров ведутся в разрезе складов.

## Расположение

```
src/app/components/modules/stores/
├── store-listing/     # таблица-список складов
│   ├── store-listing.ts
│   └── store-listing.html
└── store-editor/      # попап создания/редактирования
    ├── store-editor.ts
    └── store-editor.html
```

## Маршрут

| Путь              | Компонент               |
| ----------------- | ----------------------- |
| `/catalog/stores` | `StoreListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Каталог → Склады» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `StoreListingComponent`

Селектор `app-store-listing`. Таблица на базе `ListingComponent`.

- **Колонки:** `id`, `title`, `address` (все сортируемые).
- **Состояние (signals):** `stores: StoreModel[]`, `loading`, `meta`, `pageSize` (50), `page` (1).
- **Приватные поля:** `currentSort`, `currentDirection`.
- **Методы:** `loadStores()`, `onRowClick()`, `onEdit()`, `onDelete()`, `createClick()`, `onSort()`, `onPageChange()`.
- **Открытие едитора:** `PopupService.open('Создание магазина' | 'Редактирование магазина', StoreEditorComponent, { id })` — без `with-tabs`.
- **Удаление:** подтверждение через `ConfirmService`, затем `StoreService.delete()`.

### `StoreEditorComponent`

Селектор `app-store-editor`. Попап создания/редактирования склада.

- **Вход:** `id: number | null`.
- **Модели полей:** `guid`, `title`, `address`, `display`.
- **Состояние (signals):** `isEditMode`, `loading`, `saving`.
- **Методы:** `loadStore()`, `onSave()`, `onCancel()`.
- **Сохранение:** `Partial<StoreModel>` (`guid`, `title`, `address`, `display`) → `create()` / `update()` → `PopupService.resolve()`.

## Модели

| Модель                | Файл                                                       |
| --------------------- | ---------------------------------------------------------- |
| `StoreModel`          | `src/app/models/store.model.ts`                            |
| `StoreIndexParams`    | `src/app/models/params/store-index.params.ts`              |
| `StoresIndexResponse` | `src/app/models/responses/stores/stores-index.response.ts` |
| `StoresShowResponse`  | `src/app/models/responses/stores/stores-show.response.ts`  |

```ts
interface StoreModel {
    id: number;
    guid: string;
    title: string;
    address: string;
    display: boolean;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`StoreService` (`src/app/services/store.service.ts`), базовый путь `/stores/`.

| Метод    | HTTP   | Путь           |
| -------- | ------ | -------------- |
| `index`  | GET    | `/stores/`     |
| `show`   | GET    | `/stores/{id}` |
| `create` | POST   | `/stores/`     |
| `update` | PUT    | `/stores/{id}` |
| `delete` | DELETE | `/stores/{id}` |

- **Query (index):** `page`, `per_page`, `sort`, `direction`.

## Зависимости

- `ListingComponent`, `InputFieldComponent`, `CheckboxFieldComponent`, `SkeletonComponent`.
- `PopupService`, `ConfirmService`, `NotificationService`.

## Где используется

- `ProductsEditorComponent` — таб «Остатки»: количество товара по каждому складу.
- `ProductsFiltersComponent` — фильтр по складам.
- `ReceiveFormComponent` — селект «Склад» в поступлении (куда приходуется товар).
- `ReceiveProductsListComponent` — косвенно, через остатки товара.
