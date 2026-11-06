# API

Описание всех эндпоинтов, используемых фронтендом `v2-dashboard`.

## Базовые сведения

- **Базовый URL:** `https://api.5ife.ru/api` (см. `src/environments/environment.ts`, поле `apiUrl`).
- **Формат:** JSON (`Content-Type: application/json`), кроме загрузки файлов (`multipart/form-data`).
- **Авторизация:** заголовок `Authorization` со значением `{token_type} {access_token}`.
  Токен добавляется автоматически в `src/app/interceptors/auth.interceptor.ts` из `AuthService.getToken()`.

### Общие query-параметры листингов

Большинство `index`-эндпоинтов поддерживают:

| Параметр    | Тип             | Описание                     |
| ----------- | --------------- | ---------------------------- |
| `page`      | number          | Номер страницы               |
| `per_page`  | number          | Элементов на страницу        |
| `query`     | string          | Поиск (у товаров — `search`) |
| `sort`      | string          | Поле сортировки              |
| `direction` | `asc` \| `desc` | Направление сортировки       |

---

## Аутентификация

### POST `/login`

Вход в систему.

- **Сервис:** `AuthService.login(email, password)`
- **Тело запроса:**

```json
{ "email": "user@example.com", "password": "secret" }
```

- **Ответ:** `AuthLoginResponse` — `token_type`, `access_token`, `user`.

---

## Атрибуты

Базовый путь: `/attributes/` — сервис `AttributeService`.

| Метод  | Путь               | Описание         | Ответ                     |
| ------ | ------------------ | ---------------- | ------------------------- |
| GET    | `/attributes/`     | Список атрибутов | `AttributesIndexResponse` |
| GET    | `/attributes/{id}` | Атрибут по ID    | `AttributesShowResponse`  |
| POST   | `/attributes/`     | Создать атрибут  | `AttributeShortModel`     |
| PUT    | `/attributes/{id}` | Обновить атрибут | `AttributeShortModel`     |
| DELETE | `/attributes/{id}` | Удалить атрибут  | —                         |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## Категории

Базовый путь: `/categories/` — сервис `CategoriesService`.

| Метод  | Путь               | Описание           | Ответ                      |
| ------ | ------------------ | ------------------ | -------------------------- |
| GET    | `/categories/`     | Список категорий   | `CategoriesIndexResponse`  |
| GET    | `/categories/{id}` | Категория по ID    | `CategoriesShowResponse`   |
| POST   | `/categories/`     | Создать категорию  | `CategoriesCreateResponse` |
| PUT    | `/categories/{id}` | Обновить категорию | `CategoriesUpdateResponse` |
| DELETE | `/categories/{id}` | Удалить категорию  | —                          |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `parent_id`.

---

## Файловый менеджер

Базовый путь: `/files` — сервис `FileManagerService`.

| Метод | Путь            | Описание                   | Ответ                             |
| ----- | --------------- | -------------------------- | --------------------------------- |
| GET   | `/files`        | Содержимое директории      | `FileManagerDirectoryResponse`    |
| POST  | `/files/folder` | Создать папку              | `FileManagerCreateFolderResponse` |
| POST  | `/files/upload` | Загрузить файл (multipart) | `FileManagerUploadResponse`       |

- **GET `/files`** — query `path` (путь директории, по умолчанию пустой).
- **POST `/files/folder`** — тело `{ name, path }`.
- **POST `/files/upload`** — `multipart/form-data`: поле `file` (файл), `path` (опционально).

---

## Модули

Базовый путь: `/modules/` — сервис `ModuleService`.

| Метод | Путь        | Описание       | Ответ                  |
| ----- | ----------- | -------------- | ---------------------- |
| GET   | `/modules/` | Список модулей | `ModulesIndexResponse` |

---

## Бэкапы баз данных

Базовый путь: `/backups/` — сервис `BackupService`.

| Метод | Путь                | Описание                 | Ответ         |
| ----- | ------------------- | ------------------------ | ------------- |
| GET   | `/backups/`         | Список бэкапов           | `BackupsIndexResponse` |
| POST  | `/backups/`         | Создать новый бэкап      | `BackupModel` |
| GET   | `/backups/{file}/download` | Скачать файл бэкапа | бинарный поток |
| POST  | `/backups/restore`  | Восстановить базу из дампа | —            |

**GET `/backups/`** — список файлов дампов в `database/backups`. Ответ:

```json
{
  "data": [
    {
      "name": "dump_2026-11-03_17-19-23.sql.gz",
      "size": 12582912,
      "size_human": "12.00 MB",
      "extension": "gz",
      "path": "database/backups/dump_2026-11-03_17-19-23.sql.gz"
    }
  ]
}
```

**POST `/backups/`** — тело `{ "compress": true, "no_ssl": true }` (оба опциональны).

**GET `/backups/{file}/download`** — отдаёт файл дампа на скачивание (`Content-Disposition: attachment`). `{file}` — имя файла из `database/backups/` (без слэшей).

**POST `/backups/restore`** — тело:

```json
{ "file": "dump_2026-11-03_17-19-23.sql.gz", "create_database": false, "no_ssl": true }
```

- `file` — имя файла из `database/backups/` или абсолютный путь (обязательный);
- `create_database` — создать БД, если её нет;
- `no_ssl` — отключить TLS/SSL при подключении к БД.

---

## Страницы

Базовый путь: `/pages/` — сервис `PageService`.

| Метод  | Путь          | Описание          | Ответ                |
| ------ | ------------- | ----------------- | -------------------- |
| GET    | `/pages/`     | Список страниц    | `PagesIndexResponse` |
| GET    | `/pages/{id}` | Страница по ID    | `PagesShowResponse`  |
| POST   | `/pages/`     | Создать страницу  | `PageModel`          |
| PUT    | `/pages/{id}` | Обновить страницу | `PageModel`          |
| DELETE | `/pages/{id}` | Удалить страницу  | —                    |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## Цены

Базовый путь: `/prices/` — сервис `PriceService`.

| Метод  | Путь           | Описание      | Ответ                 |
| ------ | -------------- | ------------- | --------------------- |
| GET    | `/prices/`     | Список цен    | `PricesIndexResponse` |
| GET    | `/prices/{id}` | Цена по ID    | `PricesShowResponse`  |
| POST   | `/prices/`     | Создать цену  | `PriceModel`          |
| PUT    | `/prices/{id}` | Обновить цену | `PriceModel`          |
| DELETE | `/prices/{id}` | Удалить цену  | —                     |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## Товары

Базовый путь: `/products/` — сервис `ProductService`.

| Метод | Путь             | Описание       | Ответ                   |
| ----- | ---------------- | -------------- | ----------------------- |
| GET   | `/products/`     | Список товаров | `ProductsIndexResponse` |
| GET   | `/products/{id}` | Товар по ID    | `ProductsShowResponse`  |
| POST  | `/products/`     | Создать товар  | `ProductsStoreResponse` |
| PUT   | `/products/{id}` | Обновить товар | `ProductsStoreResponse` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `categories`, `stores`, `attributes`, `prices`.
    - `categories`, `stores` — списки ID через запятую.
    - `attributes[0][id]=1&attributes[0][values][0]=5&attributes[0][values][1]=6` — характеристика и массив ID выбранных значений (если `values` не передан — фильтр по наличию характеристики).
    - `prices[0][id]=1&prices[0][min]=100&prices[0][max]=500` — диапазон суммы по типу цены.
- **POST/PUT body:**

```json
{
    "title": "Товар",
    "sku": "SKU-001",
    "categories": [1, 2],
    "attribute_values": [
        { "id": 5, "position": 1 },
        { "attribute_id": 3, "value": "Красный", "position": 2 },
        { "attribute_title": "Материал", "value": "Хлопок", "position": 3 }
    ],
    "prices": [{ "id": 1, "amount": 1500.0 }],
    "stores": [{ "id": 1, "count": 10 }]
}
```

- **`attribute_values`** поддерживает три варианта записи:
    - `{ "id": 5 }` — существующее значение атрибута;
    - `{ "attribute_id": 3, "value": "Красный" }` — новое значение для существующего атрибута (создаётся при отсутствии);
    - `{ "attribute_title": "Материал", "value": "Хлопок" }` — новый атрибут со значением (атрибут создаётся по `title`, если не найден).

### Изображения товара

Изображения синхронизируются вместе с товаром через `POST /products/` и `PUT /products/{id}` — отдельного эндпоинта нет.

- Если файлов нет, тело отправляется как JSON:

```json
{
    "title": "Товар",
    "pictures": [
        { "id": 3, "position": 1, "is_main": true },
        { "id": 1, "position": 2, "is_main": false }
    ]
}
```

- Если есть новые файлы — `multipart/form-data`. Скалярные поля передаются как есть, массивы/объекты — JSON-строками, файлы — `pictures[i][file]`:

```
title=Товар
pictures[0][id]=3
pictures[0][position]=1
pictures[0][is_main]=1
pictures[1][file]=<binary>
pictures[1][position]=2
pictures[1][is_main]=0
```

> Для `PUT` с файлами используется `POST /products/{id}` с полем `_method=PUT` (Laravel не парсит multipart в PUT).

**Правила синхронизации:**

- запись с `id` — существующее изображение (обновляются `position` и `is_main`);
- запись с `file` — новое изображение: конвертируется в `webp`, сохраняется в `storage/app/public/products/{id}/`, для каждого размера из `ProductPicture::PREVIEW_SIZES` создаётся превью с префиксом (`preview-<name>.webp`);
- изображения, отсутствующие в списке, удаляются вместе с файлами;
- ровно одно изображение всегда помечается главным (`is_main`).

---

## Настройки

Базовый путь: `/settings/` — сервис `SettingService`.

| Метод  | Путь             | Описание           | Ответ                   |
| ------ | ---------------- | ------------------ | ----------------------- |
| GET    | `/settings/`     | Список настроек    | `SettingsIndexResponse` |
| GET    | `/settings/{id}` | Настройка по ID    | `SettingsShowResponse`  |
| POST   | `/settings/`     | Создать настройку  | `SettingModel`          |
| PUT    | `/settings/{id}` | Обновить настройку | `SettingModel`          |
| DELETE | `/settings/{id}` | Удалить настройку  | —                       |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `group`.

---

## Статусы

Базовый путь: `/statuses/` — сервис `StatusService`.

| Метод  | Путь             | Описание        | Ответ                    |
| ------ | ---------------- | --------------- | ------------------------ |
| GET    | `/statuses/`     | Список статусов | `StatusesIndexResponse`  |
| GET    | `/statuses/{id}` | Статус по ID    | `StatusesShowResponse`   |
| POST   | `/statuses/`     | Создать статус  | `StatusesCreateResponse` |
| PUT    | `/statuses/{id}` | Обновить статус | `StatusesUpdateResponse` |
| DELETE | `/statuses/{id}` | Удалить статус  | —                        |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.
- **Тело запроса:** `{ "title": "Новый", "position": 1 }`.

---

## Поступления

Базовый путь: `/receives/` — сервис `ReceiveService`.

| Метод  | Путь             | Описание             | Ответ                    |
| ------ | ---------------- | -------------------- | ------------------------ |
| GET    | `/receives/`     | Список поступлений   | `ReceivesIndexResponse`  |
| GET    | `/receives/{id}` | Поступление по ID    | `ReceivesShowResponse`   |
| POST   | `/receives/`     | Создать поступление  | `ReceivesCreateResponse` |
| PUT    | `/receives/{id}` | Обновить поступление | `ReceivesUpdateResponse` |
| DELETE | `/receives/{id}` | Удалить поступление  | —                        |

- **Query (index):** `page`, `per_page`, `sort`, `direction`.
- **Тело запроса:**

```json
{
    "store_id": 1,
    "supplier_id": 3,
    "comment": "Поставка",
    "payed": 1500,
    "products": [
        { "product_id": 1, "count": 10, "purchase_price": 250, "price_id": 2, "new_value": 1200 }
    ]
}
```

- `store_id` — склад, `supplier_id` — контрагент, `payed` — оплаченная сумма (целое число).
- `products[].count` — количество, `products[].purchase_price` — закупочная цена за единицу (целое число).
- `products[].price_id` — тип цены, `products[].new_value` — новая цена (необязательно).
- `old_value` не передаётся: сервер сам берёт текущую цену товара по `price_id`.
- При сохранении: цена товара по `price_id` обновляется на `new_value`, к остатку товара на складе `store_id` прибавляется `count`.
- При обновлении и удалении поступления изменения цены и остатка откатываются.
- Менеджер (`user_id`) проставляется автоматически из авторизованного пользователя.
- **Ответ:** `ReceiveModel` с `user`, `store`, `supplier`, `products`, `total_count`, `total_price`.

---

## Контрагенты

Базовый путь: `/suppliers/` — сервис `SupplierService`.

| Метод  | Путь              | Описание             | Ответ                     |
| ------ | ----------------- | -------------------- | ------------------------- |
| GET    | `/suppliers/`     | Список контрагентов  | `SuppliersIndexResponse`  |
| GET    | `/suppliers/{id}` | Контрагент по ID     | `SuppliersShowResponse`   |
| POST   | `/suppliers/`     | Создать контрагента  | `SuppliersCreateResponse` |
| PUT    | `/suppliers/{id}` | Обновить контрагента | `SuppliersUpdateResponse` |
| DELETE | `/suppliers/{id}` | Удалить контрагента  | —                         |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.
- **Тело запроса:** `{ "title": "ООО Ромашка", "description": "Описание" }`.
- `title` — обязательное, `description` — необязательное (nullable).

---

## Магазины

Базовый путь: `/stores/` — сервис `StoreService`.

| Метод  | Путь           | Описание         | Ответ                 |
| ------ | -------------- | ---------------- | --------------------- |
| GET    | `/stores/`     | Список магазинов | `StoresIndexResponse` |
| GET    | `/stores/{id}` | Магазин по ID    | `StoresShowResponse`  |
| POST   | `/stores/`     | Создать магазин  | `StoreModel`          |
| PUT    | `/stores/{id}` | Обновить магазин | `StoreModel`          |
| DELETE | `/stores/{id}` | Удалить магазин  | —                     |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## Пользователи

Базовый путь: `/users/` — сервис `UserService`.

| Метод  | Путь          | Описание              | Ответ                |
| ------ | ------------- | --------------------- | -------------------- |
| GET    | `/users/`     | Список пользователей  | `UsersIndexResponse` |
| GET    | `/users/{id}` | Пользователь по ID    | `UsersShowResponse`  |
| POST   | `/users/`     | Создать пользователя  | `UserModel`          |
| PUT    | `/users/{id}` | Обновить пользователя | `UserModel`          |
| DELETE | `/users/{id}` | Удалить пользователя  | —                    |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## OpenRouter (AI)

Базовый путь: `/open-router/` — сервис `OpenRouterService`.

| Метод | Путь                       | Описание              | Ответ                |
| ----- | -------------------------- | --------------------- | -------------------- |
| POST  | `/open-router/formatting`  | Форматирование текста | `{ "data": string }` |
| POST  | `/open-router/refactoring` | Рефакторинг текста    | `{ "data": string }` |

- **Тело запроса:** `{ "text": "..." }`.

---

## Логи

Базовый путь: `/logs/` — сервис `LogService`.

| Метод | Путь         | Описание     | Ответ               |
| ----- | ------------ | ------------ | ------------------- |
| GET   | `/logs/`     | Список логов | `LogsIndexResponse` |
| GET   | `/logs/{id}` | Лог по ID    | `LogsShowResponse`  |

- **Query (index):** `page`, `per_page`, `sort`, `direction`, `event`, `model_type`, `user_id`.
- **Пример ответа `GET /logs/{id}`:**

```json
{
    "data": {
        "id": 1,
        "event": "updated",
        "model_type": "App\\Models\\Store",
        "model_id": 15,
        "user_id": 2,
        "old_values": { "title": "Старое название" },
        "new_values": { "title": "Новое название" },
        "created_at": "2026-10-27T12:30:00.000000Z",
        "user": { "id": 2, "name": "Иван", "email": "ivan@example.com" }
    }
}
```

- **Значения `event`:** `created`, `updated`, `deleted`, `restored`.

---

## Локальные ресурсы (не API)

- **Иконки:** `IconService` загружает SVG из `/assets/icons/{name}.svg` (не через API).
