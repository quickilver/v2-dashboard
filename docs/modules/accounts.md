# Модуль «Клиенты» (accounts)

Учёт клиентов: листинг с поиском и едитор с двумя табами (данные клиента и его заказы).

## Расположение

```
src/app/components/modules/accounts/
├── accounts-listing/          # листинг клиентов
│   ├── accounts-listing.ts
│   ├── accounts-listing.html
│   └── accounts-listing.scss
└── accounts-editor/           # едитор клиента (2 таба)
    ├── accounts-editor.ts
    ├── accounts-editor.html
    └── accounts-editor.scss
```

## Маршрут

| Путь        | Компонент                  |
| ----------- | -------------------------- |
| `/accounts` | `AccountsListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Клиенты» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `AccountsListingComponent`

Селектор `app-accounts-listing`. Построен на переиспользуемом `app-listing`.

- **Колонки:** `id`, `last_name`, `first_name`, `phone`, `email`, `is_blocked` (тип `boolean` с подписями «Заблокирован» / «Активен»), `guid`, `created_at`.
- **Колонки по умолчанию:** все, кроме `guid` и `created_at` (`isDefault: true`).
- **Ключ настроек колонок:** `accounts` (`columnsStorageKey`).
- **Состояние (signals):** `accounts`, `loading`, `meta`, `pageSize` (50), `page` (1).
- **Приватное состояние:** `search`, `sort`, `direction`.
- **Методы:** `loadAccounts()`, `onSearch()`, `onRowClick()`, `onEdit()`, `createClick()`, `onDelete()`, `onSort()`, `onPageChange()`.
- **Открытие едитора:** `PopupService.open('Создание клиента' | 'Редактирование клиента', AccountsEditorComponent, { id }, 'with-tabs')`; после закрытия попапа листинг перезагружается.
- **Удаление:** подтверждение через `ConfirmService`, затем `AccountService.delete()`.

### `AccountsEditorComponent`

Селектор `app-accounts-editor`. Едитор клиента в попапе с классом `with-tabs`.

- **Вход:** `id: number | null` — если передан, едитор работает в режиме редактирования и загружает данные через `AccountService.show(id)`.
- **Табы:** `info` («Информация») и `orders` («Заказы» с счётчиком, доступен только в режиме редактирования).
- **Модели (двусторонняя привязка):** `firstName`, `lastName`, `middleName`, `phone`, `email`, `password`, `isBlocked`.
- **Состояние (signals):** `isEditMode`, `loading`, `saving`, `tab`, `orders`.
- **Computed:** `ordersCount`.
- **Методы:** `loadAccount()`, `onSave()`, `onCancel()`, `isActiveTab()`, `changeTab()`.
- **Телефон:** маска `+7 (999) 999-99-99` в поле, при сохранении — `PhoneHelper.toNumber()` (только цифры).
- **Пароль:** при редактировании пустое поле не отправляется в запросе (пароль не меняется).

## Модели

| Модель                 | Файл                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `AccountModel`         | `src/app/models/account.model.ts`                             |
| `AccountIndexParams`   | `src/app/models/params/account-index.params.ts`               |
| `AccountsIndexResponse`| `src/app/models/responses/accounts/accounts-index.response.ts`|
| `AccountsShowResponse` | `src/app/models/responses/accounts/accounts-index.response.ts`|

```ts
interface AccountModel {
    id: number;
    guid: string | null;
    first_name: string;
    last_name: string | null;
    middle_name: string | null;
    phone: number | null;
    email: string | null;
    is_blocked: boolean;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`AccountService` (`src/app/services/account.service.ts`), базовый путь `/accounts/`.

| Метод    | HTTP   | Путь             |
| -------- | ------ | ---------------- |
| `index`  | GET    | `/accounts/`     |
| `show`   | GET    | `/accounts/{id}` |
| `create` | POST   | `/accounts/`     |
| `update` | PUT    | `/accounts/{id}` |
| `delete` | DELETE | `/accounts/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `is_blocked`.

## Зависимости

- `ListingComponent` (`app-listing`) — таблица, поиск, сортировка, пагинация, настройки колонок.
- `InputFieldComponent`, `CheckboxFieldComponent`, `SkeletonComponent` — поля едитора.
- `PopupService`, `ConfirmService`, `NotificationService`.
- `PhoneHelper` (`src/app/helpers/phone.helper.ts`).

## Известные ограничения

- Таб «Заказы» пока показывает только счётчик и пустое состояние — список заказов клиента не выводится.
- Фильтр по блокировке в листинге не выведен в UI (поддерживается только сервисом и бэкендом).
