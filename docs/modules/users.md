# Модуль «Менеджеры» (users)

Управление пользователями (менеджерами) админки: список, создание, редактирование, удаление и назначение прав доступа к модулям.

## Расположение

```
src/app/components/modules/users/
├── users-listing/     # таблица-список пользователей
│   ├── users-listing.ts
│   └── users-listing.html
└── users-editor/      # попап создания/редактирования
    ├── users-editor.ts
    ├── users-editor.html
    └── users-editor.scss
```

## Маршрут

| Путь      | Компонент               |
|-----------|-------------------------|
| `/users`  | `UsersListingComponent` |

Определён в `src/app/app.routes.ts`.

## Компоненты

### `UsersListingComponent`

Селектор `app-users-listing`. Таблица пользователей на базе переиспользуемого `ListingComponent`.

- **Колонки:** `id`, `name`, `email` (все сортируемые).
- **Состояние (signals):** `users`, `loading`, `meta`, `pageSize` (50), `page` (1).
- **Приватные поля:** `currentSearch`, `currentSort`, `currentDirection`.
- **Методы:**
  - `loadUsers()` — загрузка списка через `UserService.index()` с параметрами пагинации/поиска/сортировки;
  - `onRowClick(user)` — открывает редактирование;
  - `onEdit(user)` — попап «Редактирование пользователя» с `{ id }`, после закрытия перезагружает список;
  - `createClick()` — попап «Создание пользователя» без `id`, после закрытия перезагружает список;
  - `onDelete(user)` — подтверждение через `ConfirmService` (удаление пока не реализовано, только `console.log`);
  - `onSort(sort)` / `onPageChange(page)` — смена сортировки/страницы и перезагрузка.

### `UsersEditorComponent`

Селектор `app-users-editor`. Попап создания и редактирования пользователя.

- **Вход:** `id: number | null` — если передан, режим редактирования (`isEditMode`), иначе создание.
- **Состояние (signals):** `isEditMode`, `loading`, `saving`, `tab` (`info` | `modules`).
- **Модели полей:** `name`, `email`, `password`, `fullAccess`.
- **Данные:** `modules` (список модулей), `permissions` (id доступных модулей).
- **Computed:** `permissionsCount` (кол-во доступных модулей), `flatModules` (модули с вложенными дочерними).
- **Методы:**
  - `loadModules()` — загрузка модулей через `ModuleService.index()`;
  - `loadUser(id)` — загрузка данных пользователя через `UserService.show()`, включая нормализацию прав;
  - `normalizePermissions(permissions)` — приводит `number[]` или `{ id }[]` к `number[]`;
  - `onSave()` — создание (`create`) или обновление (`update`); пароль отправляется только если заполнен;
  - `onCancel()` — закрытие попапа;
  - `toggleModule(moduleId)` — включение/выключение права на модуль;
  - `isActiveTab(tab)` / `changeTab(tab)` — переключение вкладок.

## Вкладки редактора

- **Информация** — поля «Имя», «Email», «Пароль» (тип `password`), чекбокс «Полный доступ».
- **Модули** — дерево модулей с чекбоксами; в заголовке вкладки отображается количество доступных модулей: `Модули ({{ permissionsCount() }})`.

## Модели

| Модель                | Файл                                              | Назначение                          |
|-----------------------|---------------------------------------------------|-------------------------------------|
| `UserModel`           | `src/app/models/user.model.ts`                    | Полная модель пользователя          |
| `UserShort`           | `src/app/models/users/user-short.model.ts`        | Краткая модель для списка           |
| `UserIndexParams`     | `src/app/models/params/user-index.params.ts`      | Параметры запроса списка            |
| `UsersIndexResponse`  | `src/app/models/responses/users/users-index.response.ts` | Ответ списка (`data`, `meta`) |
| `UsersShowResponse`   | `src/app/models/responses/users/users-show.response.ts`  | Ответ одного пользователя     |
| `ModuleModel`         | `src/app/models/module.model.ts`                  | Модуль (для прав доступа)           |

### `UserModel`

```ts
interface UserModel {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    full_access: boolean;
    permissions?: number[] | { id: number }[];
    created_at: string;
    updated_at: string;
}
```

> `permissions` может приходить как массив id, так и массив объектов-модулей — обрабатывается в `normalizePermissions()`.

## Сервис

`UserService` (`src/app/services/user.service.ts`), базовый путь `/users/`.

| Метод    | HTTP   | Путь           | Описание             |
|----------|--------|----------------|----------------------|
| `index`  | GET    | `/users/`      | Список пользователей |
| `show`   | GET    | `/users/{id}`  | Пользователь по ID   |
| `create` | POST   | `/users/`      | Создать пользователя |
| `update` | PUT    | `/users/{id}`  | Обновить пользователя|
| `delete` | DELETE | `/users/{id}`  | Удалить пользователя |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.
- **Тело create/update:** `name`, `email`, `full_access`, `permissions`, `password` (опционально).

## Зависимости

- `ListingComponent` — таблица-листинг.
- `InputFieldComponent`, `CheckboxFieldComponent` — поля формы.
- `PopupService` — открытие попапов.
- `ConfirmService` — подтверждение удаления.
- `NotificationService` — уведомления об успехе/ошибке.
- `ModuleService` — список модулей для назначения прав.

## Известные ограничения

- Удаление пользователя не реализовано: `onDelete()` показывает подтверждение, но вместо вызова `UserService.delete()` пишет в `console.log`.
