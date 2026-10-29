# API

Описание всех эндпоинтов, используемых фронтендом `v2-dashboard`.

## Базовые сведения

- **Базовый URL:** `https://api.5ife.ru/api` (см. `src/environments/environment.ts`, поле `apiUrl`).
- **Формат:** JSON (`Content-Type: application/json`), кроме загрузки файлов (`multipart/form-data`).
- **Авторизация:** заголовок `Authorization` со значением `{token_type} {access_token}`.
  Токен добавляется автоматически в `src/app/interceptors/auth.interceptor.ts` из `AuthService.getToken()`.

### Общие query-параметры листингов

Большинство `index`-эндпоинтов поддерживают:

| Параметр    | Тип                | Описание                          |
|-------------|--------------------|-----------------------------------|
| `page`      | number             | Номер страницы                    |
| `per_page`  | number             | Элементов на страницу             |
| `query`     | string             | Поиск (у товаров — `search`)      |
| `sort`      | string             | Поле сортировки                   |
| `direction` | `asc` \| `desc`    | Направление сортировки            |

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

| Метод  | Путь              | Описание              | Ответ                     |
|--------|-------------------|-----------------------|---------------------------|
| GET    | `/attributes/`    | Список атрибутов      | `AttributesIndexResponse` |
| GET    | `/attributes/{id}`| Атрибут по ID         | `AttributesShowResponse`  |
| POST   | `/attributes/`    | Создать атрибут       | `AttributeShortModel`     |
| PUT    | `/attributes/{id}`| Обновить атрибут      | `AttributeShortModel`     |
| DELETE | `/attributes/{id}`| Удалить атрибут       | —                         |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## Категории

Базовый путь: `/categories/` — сервис `CategoriesService`.

| Метод  | Путь                | Описание              | Ответ                       |
|--------|---------------------|-----------------------|-----------------------------|
| GET    | `/categories/`      | Список категорий      | `CategoriesIndexResponse`   |
| GET    | `/categories/{id}`  | Категория по ID       | `CategoriesShowResponse`    |
| POST   | `/categories/`      | Создать категорию     | `CategoriesCreateResponse`  |
| PUT    | `/categories/{id}`  | Обновить категорию    | `CategoriesUpdateResponse`  |
| DELETE | `/categories/{id}`  | Удалить категорию     | —                           |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `parent_id`.

---

## Файловый менеджер

Базовый путь: `/files` — сервис `FileManagerService`.

| Метод | Путь             | Описание                    | Ответ                              |
|-------|------------------|-----------------------------|------------------------------------|
| GET   | `/files`         | Содержимое директории       | `FileManagerDirectoryResponse`     |
| POST  | `/files/folder`  | Создать папку               | `FileManagerCreateFolderResponse`  |
| POST  | `/files/upload`  | Загрузить файл (multipart)  | `FileManagerUploadResponse`        |

- **GET `/files`** — query `path` (путь директории, по умолчанию пустой).
- **POST `/files/folder`** — тело `{ name, path }`.
- **POST `/files/upload`** — `multipart/form-data`: поле `file` (файл), `path` (опционально).

---

## Модули

Базовый путь: `/modules/` — сервис `ModuleService`.

| Метод | Путь          | Описание        | Ответ                  |
|-------|---------------|-----------------|------------------------|
| GET   | `/modules/`   | Список модулей  | `ModulesIndexResponse` |

---

## Страницы

Базовый путь: `/pages/` — сервис `PageService`.

| Метод  | Путь            | Описание          | Ответ                 |
|--------|-----------------|-------------------|-----------------------|
| GET    | `/pages/`       | Список страниц    | `PagesIndexResponse`  |
| GET    | `/pages/{id}`   | Страница по ID    | `PagesShowResponse`   |
| POST   | `/pages/`       | Создать страницу  | `PageModel`           |
| PUT    | `/pages/{id}`   | Обновить страницу | `PageModel`           |
| DELETE | `/pages/{id}`   | Удалить страницу  | —                     |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## Цены

Базовый путь: `/prices/` — сервис `PriceService`.

| Метод  | Путь             | Описание        | Ответ                  |
|--------|------------------|-----------------|------------------------|
| GET    | `/prices/`       | Список цен      | `PricesIndexResponse`  |
| GET    | `/prices/{id}`   | Цена по ID      | `PricesShowResponse`   |
| POST   | `/prices/`       | Создать цену    | `PriceModel`           |
| PUT    | `/prices/{id}`   | Обновить цену   | `PriceModel`           |
| DELETE | `/prices/{id}`   | Удалить цену    | —                      |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## Товары

Базовый путь: `/products/` — сервис `ProductService`.

| Метод | Путь               | Описание        | Ответ                    |
|-------|--------------------|-----------------|--------------------------|
| GET   | `/products/`       | Список товаров  | `ProductsIndexResponse`  |
| GET   | `/products/{id}`   | Товар по ID     | `ProductsShowResponse`   |
| POST  | `/products/`       | Создать товар   | `ProductsStoreResponse`  |
| PUT   | `/products/{id}`   | Обновить товар  | `ProductsStoreResponse`  |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.
- **POST/PUT body:**

```json
{
  "title": "Товар",
  "sku": "SKU-001",
  "categories": [1, 2],
  "attribute_values": [{"id": 5, "position": 1}, {"id": 8}],
  "prices": [{"id": 1, "amount": 1500.00}],
  "stores": [{"id": 1, "count": 10}]
}
```

---

## Настройки

Базовый путь: `/settings/` — сервис `SettingService`.

| Метод  | Путь               | Описание           | Ответ                   |
|--------|--------------------|--------------------|-------------------------|
| GET    | `/settings/`       | Список настроек    | `SettingsIndexResponse` |
| GET    | `/settings/{id}`   | Настройка по ID    | `SettingsShowResponse`  |
| POST   | `/settings/`       | Создать настройку  | `SettingModel`          |
| PUT    | `/settings/{id}`   | Обновить настройку | `SettingModel`          |
| DELETE | `/settings/{id}`   | Удалить настройку  | —                       |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `group`.

---

## Магазины

Базовый путь: `/stores/` — сервис `StoreService`.

| Метод  | Путь             | Описание         | Ответ                  |
|--------|------------------|------------------|------------------------|
| GET    | `/stores/`       | Список магазинов | `StoresIndexResponse`  |
| GET    | `/stores/{id}`   | Магазин по ID    | `StoresShowResponse`   |
| POST   | `/stores/`       | Создать магазин  | `StoreModel`           |
| PUT    | `/stores/{id}`   | Обновить магазин | `StoreModel`           |
| DELETE | `/stores/{id}`   | Удалить магазин  | —                      |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## Пользователи

Базовый путь: `/users/` — сервис `UserService`.

| Метод  | Путь            | Описание             | Ответ                 |
|--------|-----------------|----------------------|-----------------------|
| GET    | `/users/`       | Список пользователей | `UsersIndexResponse`  |
| GET    | `/users/{id}`   | Пользователь по ID   | `UsersShowResponse`   |
| POST   | `/users/`       | Создать пользователя | `UserModel`           |
| PUT    | `/users/{id}`   | Обновить пользователя| `UserModel`           |
| DELETE | `/users/{id}`   | Удалить пользователя | —                     |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

---

## OpenRouter (AI)

Базовый путь: `/open-router/` — сервис `OpenRouterService`.

| Метод | Путь                        | Описание                    | Ответ              |
|-------|-----------------------------|-----------------------------|--------------------|
| POST  | `/open-router/formatting`   | Форматирование текста       | `{ "data": string }` |
| POST  | `/open-router/refactoring`  | Рефакторинг текста          | `{ "data": string }` |

- **Тело запроса:** `{ "text": "..." }`.

---

## Логи

Базовый путь: `/logs/` — сервис `LogService`.

| Метод | Путь           | Описание      | Ответ               |
|-------|----------------|---------------|---------------------|
| GET   | `/logs/`       | Список логов  | `LogsIndexResponse` |
| GET   | `/logs/{id}`   | Лог по ID     | `LogsShowResponse`  |

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
