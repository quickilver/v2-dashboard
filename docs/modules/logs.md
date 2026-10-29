# Модуль «Логи» (logs)

Просмотр истории изменений по сущностям: кто, что и когда изменил.

## Расположение

```
src/app/components/modules/logs/
├── log-listing/      # таблица-список логов
│   ├── log-listing.ts
│   └── log-listing.html
└── log-details/      # попап просмотра лога
    ├── log-details.ts
    ├── log-details.html
    ├── log-details.scss
    └── log-helpers.ts
```

## Маршрут

| Путь    | Компонент           |
|---------|---------------------|
| `/logs` | `LogListingComponent` |

Определён в `src/app/app.routes.ts`.

## Компоненты

### `LogListingComponent`

Селектор `app-log-listing`. Таблица логов на базе переиспользуемого `ListingComponent`.

- **Колонки:** `id`, `event` (локализованное название события), `model_type` (короткое имя без namespace), `model_id`, `user` (имя + email пользователя), `created_at` (локализованная дата).
- **Состояние (signals):** `logs`, `rows` (computed — подготовленные строки для таблицы), `loading`, `meta`, `pageSize` (50), `page` (1).
- **Методы:**
  - `loadLogs()` — загрузка списка через `LogService.index()` с параметрами пагинации/сортировки;
  - `onRowClick(row)` — открывает попап просмотра лога;
  - `onDetails(log)` — попап «Просмотр лога» с `{ id }`;
  - `onSort(sort)` / `onPageChange(page)` — смена сортировки/страницы и перезагрузка.

> Листинг только для просмотра: `actionsColumn` и «Создать» скрыты.

### `LogDetailsComponent`

Селектор `app-log-details`. Попап детального просмотра одного лога.

- **Вход:** `id: number`.
- **Состояние (signals):** `loading`, `log`.
- **Метод:** `onClose()` — закрытие попапа; `loadLog(id)` — загрузка через `LogService.show()`.

Отображает:
- бейдж события (`created` — зелёный, `updated` — фиолетовый, `deleted` — красный, `restored` — синий) и дату;
- основные поля (`id`, сущность, `model_id`, пользователь);
- блоки **Старые значения** и **Новые значения** — `old_values` / `new_values` как JSON (pretty-printed).

## Хелперы (`log-helpers.ts`)

| Экспорт                | Назначение                                           |
|------------------------|------------------------------------------------------|
| `LogEventLabel`        | Словарь `LogEvent` → русское название события        |
| `formatModelType()`    | Убирает namespace: `App\Models\Store` → `Store`      |
| `formatJson()`         | JSON с отступами; `null`/`undefined` → `—`           |

## Модели

| Модель                | Файл                                             | Назначение                        |
|-----------------------|--------------------------------------------------|-----------------------------------|
| `LogModel`            | `src/app/models/log.model.ts`                    | Полная модель лога                |
| `LogIndexParams`      | `src/app/models/params/log-index.params.ts`      | Параметры запроса списка          |
| `LogsIndexResponse`   | `src/app/models/responses/logs/logs-index.response.ts` | Ответ списка (`data`, `meta`) |
| `LogsShowResponse`    | `src/app/models/responses/logs/logs-show.response.ts`  | Ответ одного лога           |

### `LogModel`

```ts
interface LogModel {
    id: number;
    event: 'updated' | 'created' | 'deleted' | 'restored';
    model_type: string;   // например "App\Models\Store"
    model_id: number;
    user_id: number;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    created_at: string;
    user: UserModel;
}
```

## Сервис

`LogService` (`src/app/services/log.service.ts`), базовый путь `/logs/`.

| Метод  | HTTP | Путь          | Описание     |
|--------|------|---------------|--------------|
| `index`| GET  | `/logs/`      | Список логов |
| `show` | GET  | `/logs/{id}`  | Лог по ID    |

- **Query (index):** `page`, `per_page`, `sort`, `direction`, `event`, `model_type`, `user_id`.

## Зависимости

- `ListingComponent` — таблица-листинг.
- `PopupService` — открытие попапа просмотра.
- `NotificationService` — уведомления об ошибках.

## Известные ограничения

- У логов нет CRUD — только просмотр (`index`, `show`).
- Сортировка по колонке `user` не поддерживается бэкендом (поле не сортируемое).