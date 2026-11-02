# Модуль «Статусы» (statuses)

Справочник статусов заказов: название и позиция сортировки.

## Расположение

```
src/app/components/modules/statuses/
├── statuses-listing/      # таблица-список статусов
│   ├── statuses-listing.ts
│   └── statuses-listing.html
└── statuses-editor/       # попап создания/редактирования
    ├── statuses-editor.ts
    └── statuses-editor.html
```

## Маршрут

| Путь               | Компонент                  |
| ------------------ | -------------------------- |
| `/orders/statuses` | `StatusesListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Заказы → Статусы» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `StatusesListingComponent`

Селектор `app-statuses-listing`. Таблица на базе `ListingComponent`.

- **Колонки:** `id`, `title`, `position`.
- **Состояние (signals):** `statuses`, `loading`, `meta`, `pageSize` (50), `page` (1).
- **Методы:** `loadStatuses()`, `onRowClick()`, `onEdit()`, `onDelete()`, `createClick()`, `onSearch()`, `onSort()`, `onPageChange()`.

### `StatusesEditorComponent`

Селектор `app-statuses-editor`. Попап создания/редактирования.

- **Вход:** `id: number | null`.
- **Поля:** `title`, `position`.
- **Методы:** `onSave()`, `onCancel()`.

## Модели

| Модель                   | Файл                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `StatusModel`            | `src/app/models/status.model.ts`                                |
| `StatusIndexParams`      | `src/app/models/params/status-index.params.ts`                  |
| `StatusesIndexResponse`  | `src/app/models/responses/statuses/statuses-index.response.ts`  |
| `StatusesShowResponse`   | `src/app/models/responses/statuses/statuses-show.response.ts`   |
| `StatusesCreateResponse` | `src/app/models/responses/statuses/statuses-create.response.ts` |
| `StatusesUpdateResponse` | `src/app/models/responses/statuses/statuses-update.response.ts` |

```ts
interface StatusModel {
    id: number;
    title: string;
    position: number;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`StatusService` (`src/app/services/status.service.ts`), базовый путь `/statuses/`.

| Метод    | HTTP   | Путь             |
| -------- | ------ | ---------------- |
| `index`  | GET    | `/statuses/`     |
| `show`   | GET    | `/statuses/{id}` |
| `create` | POST   | `/statuses/`     |
| `update` | PUT    | `/statuses/{id}` |
| `delete` | DELETE | `/statuses/{id}` |

## Бэкенд

- `StatusController` — CRUD, `index` использует `StatusFilter`.
- `StatusFilter` (`app/Http/Filters/StatusFilter.php`) — поиск по `title` (`query`).
- `StatusRequest` — валидация: `title` (required, max 255), `position` (integer, min 0).
- `StatusResource` — `id`, `title`, `position`, `created_at`, `updated_at`.
- Маршрут: `Route::apiResource('statuses', StatusController::class)` под `permission:statuses`.
