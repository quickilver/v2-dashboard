# Модуль «Контрагенты» (suppliers)

Справочник контрагентов: название и описание. Техническое имя сущности — `suppliers`.

## Расположение

```
src/app/components/modules/suppliers/
├── suppliers-listing/     # таблица-список контрагентов
│   ├── suppliers-listing.ts
│   └── suppliers-listing.html
└── suppliers-editor/      # попап создания/редактирования
    ├── suppliers-editor.ts
    └── suppliers-editor.html
```

## Маршрут

| Путь         | Компонент                   |
| ------------ | --------------------------- |
| `/suppliers` | `SuppliersListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Каталог → Контрагенты» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `SuppliersListingComponent`

Селектор `app-suppliers-listing`. Таблица на базе `ListingComponent`.

- **Колонки:** `id`, `title`, `description`.
- **Состояние (signals):** `suppliers`, `loading`, `meta`, `pageSize` (50), `page` (1).
- **Методы:** `loadSuppliers()`, `onRowClick()`, `onEdit()`, `onDelete()`, `createClick()`, `onSearch()`, `onSort()`, `onPageChange()`.

### `SuppliersEditorComponent`

Селектор `app-suppliers-editor`. Попап создания/редактирования.

- **Вход:** `id: number | null`.
- **Поля:** `title` (`app-input-field`), `description` (`app-textarea-field`).
- **Методы:** `onSave()`, `onCancel()`.

## Модели

| Модель                    | Файл                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| `SupplierModel`           | `src/app/models/supplier.model.ts`                                |
| `SupplierIndexParams`     | `src/app/models/params/supplier-index.params.ts`                  |
| `SuppliersIndexResponse`  | `src/app/models/responses/suppliers/suppliers-index.response.ts`  |
| `SuppliersShowResponse`   | `src/app/models/responses/suppliers/suppliers-show.response.ts`   |
| `SuppliersCreateResponse` | `src/app/models/responses/suppliers/suppliers-create.response.ts` |
| `SuppliersUpdateResponse` | `src/app/models/responses/suppliers/suppliers-update.response.ts` |

```ts
interface SupplierModel {
    id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`SupplierService` (`src/app/services/supplier.service.ts`), базовый путь `/suppliers/`.

| Метод    | HTTP   | Путь              |
| -------- | ------ | ----------------- |
| `index`  | GET    | `/suppliers/`     |
| `show`   | GET    | `/suppliers/{id}` |
| `create` | POST   | `/suppliers/`     |
| `update` | PUT    | `/suppliers/{id}` |
| `delete` | DELETE | `/suppliers/{id}` |

## Бэкенд

- `SupplierController` — CRUD, `index` использует `SupplierFilter`.
- `SupplierFilter` (`app/Http/Filters/SupplierFilter.php`) — поиск по `title` и `description` (`query`).
- `SupplierRequest` — валидация: `title` (required, max 255), `description` (nullable, string).
- `SupplierResource` — `id`, `title`, `description`, `created_at`, `updated_at`.
- Миграция: `database/migrations/2026_10_30_000001_create_suppliers_table.php`.
- Маршрут: `Route::apiResource('suppliers', SupplierController::class)` под `permission:suppliers`.
