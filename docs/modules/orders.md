# Модуль «Заказы» (orders)

Оформление заказов: листинг с фильтрами и едитор с тремя табами (информация, клиент, товары).
Создание и редактирование выполняются в одном и том же едиторе.

## Расположение

```
src/app/components/modules/orders/
├── orders-listing/            # листинг заказов
│   ├── orders-listing.ts
│   ├── orders-listing.html
│   └── orders-listing.scss
├── orders-filters/            # панель фильтров (левая колонка)
│   ├── orders-filters.ts
│   ├── orders-filters.html
│   └── orders-filters.scss
├── orders-editor/             # едитор заказа (3 таба)
│   ├── orders-editor.ts
│   ├── orders-editor.html
│   └── orders-editor.scss
├── orders-account-tab/        # таб «Клиент»
│   ├── orders-account-tab.ts
│   ├── orders-account-tab.html
│   └── orders-account-tab.scss
└── orders-products-tab/       # таб «Товары»
    ├── orders-products-tab.ts
    ├── orders-products-tab.html
    └── orders-products-tab.scss
```

## Маршрут

| Путь      | Компонент                |
| --------- | ------------------------ |
| `/orders` | `OrdersListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Заказы» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `OrdersListingComponent`

Селектор `app-orders-listing`. Двухколоночная раскладка: слева `app-orders-filters`, справа `app-listing`.

- **Колонки:** `number`, `id`, `contact_phone`, `contact_email`, `contact_last_name`, `contact_first_name`, `status`, `total_price`.
- **Форматтеры:** `status` → `row.status?.title` (объект `StatusModel` нельзя выводить напрямую);
  `total_price` → `PriceHelper.formatInteger(row.total_price)` (разделители тысяч).
- **Колонки по умолчанию:** все, кроме `id` (`isDefault: true`).
- **Ключ настроек колонок:** `orders` (`columnsStorageKey`).
- **Состояние (signals):** `orders`, `loading`, `meta`, `pageSize` (50), `page` (1), `filters`.
- **Приватное состояние:** `currentSort`, `currentDirection`.
- **Методы:** `loadOrders()`, `onFiltersChange()`, `onRowClick()`, `createClick()`, `onSort()`, `onPageChange()`.
- **Открытие едитора:** `PopupService.open('Заказ {number}' | 'Создание заказа', OrdersEditorComponent, { id }, 'with-tabs')`; после закрытия попапа листинг перезагружается.
- **Особенности:** `[actionsColumn]="false"` и `[searchable]="false"` — поиск вынесен в панель фильтров.

### `OrdersFiltersComponent`

Селектор `app-orders-filters`. Панель фильтров с раскрывающимися группами.

- **Модель:** `filters: OrderFilters` (`query`, `account_id`, `product_id`, `date_from`, `date_to`).
- **Состояние (signals):** `expandedGroups` (`account`, `product`, `date`), `accountSearch`, `selectedAccount`, `productSearch`, `selectedProduct`.
- **Computed:** `accountCount`, `productCount`, `dateCount` — счётчики активных фильтров в группах.
- **Методы:** `isExpanded()`, `toggleGroup()`, `onQueryChange()`, `onAccountChange()`, `onProductChange()`, `onDateFromChange()`, `onDateToChange()`.
- **Поля:** `app-input-field` (поиск), `app-autocomplete-accounts-field` (клиент), `app-autocomplete-products-field` (товар), `app-calendar-field` (даты от/до).

### `OrdersEditorComponent`

Селектор `app-orders-editor`. Едитор заказа в попапе с классом `with-tabs`.

- **Вход:** `id: number | null` — если передан, едитор работает в режиме редактирования и загружает заказ через `OrderService.show(id)`.
- **Табы:** `info` («Информация»), `account` («Клиент» — `app-orders-account-tab`), `products` («Товары» — `app-orders-products-tab`, со счётчиком).
- **Модели (двусторонняя привязка):** `accountSearch`, `selectedAccount`, `contactPhone`, `contactEmail`, `contactFirstName`, `contactLastName`, `contactMiddleName`, `comment`, `statusId`.
- **Состояние (signals):** `isEditMode`, `loading`, `saving`, `tab`, `order`, `statusOptions`, `products`, `counts`, `amounts`.
- **Computed:** `productsCount`, `totalPrice`, `accountName`.
- **Методы:** `loadStatuses()`, `loadOrder()`, `onSave()`, `onCancel()`, `isActiveTab()`, `changeTab()`.
- **Таб «Информация»:** в режиме редактирования сверху выводятся read-only строки (номер, ID, дата оформления, сумма), ниже — селект статуса и комментарий.

### `OrdersAccountTabComponent`

Селектор `app-orders-account-tab`. Содержимое таба «Клиент».

- **Модели:** `accountSearch`, `selectedAccount`, `contactPhone`, `contactEmail`, `contactFirstName`, `contactLastName`, `contactMiddleName`.
- **Методы:** `onAccountChange(account)` — заполняет пустые поля контактными данными выбранного клиента (телефон форматируется через `PhoneHelper.format`).
- **Поля:** `app-autocomplete-accounts-field` + `app-input-field` (ФИО, телефон с маской `+7 (999) 999-99-99`, email).

### `OrdersProductsTabComponent`

Селектор `app-orders-products-tab`. Содержимое таба «Товары».

- **Модели:** `products` (`model.required`), `counts`, `amounts` — общие с едитором, поэтому состояние не дублируется.
- **Computed:** `productsCount`, `totalPrice`.
- **Методы:** `onProductSelected()`, `onProductRemoved()`, `getCount()`, `onCountChange()`, `getAmount()`, `onAmountChange()`, `getTotal()`.
- **Цена по умолчанию:** при добавлении товара цена подставляется из настройки `order-default-price-id` («Тип цены по умолчанию», группа «Заказы»). Значение настройки читается через `SettingService.findByAlias()`, затем `ProductService.show(productId)` ищет цену товара с этим `price_id`; если цены нет — остаётся `0`.
- **Разметка:** `app-products-list-field` для добавления, таблица позиций (ID, товар + SKU, цена, количество, сумма, удаление), итог в `tfoot`.
- **Расчёты:** вынесены в `helpers/order-products.helper.ts` (`getProductCount`, `getProductAmount`, `getProductTotal`, `getProductsTotal`) — используются и в едиторе для `totalPrice`.
- **Сохранение:** `isEditMode()` → `OrderService.update(id, payload)`, иначе `OrderService.create(payload)`; после успеха — уведомление и `PopupService.resolve()`.
- **Клиент не выбран:** если `account_id` пуст, но заполнено имя контактного лица, бэкенд сам создаёт клиента (или находит по телефону/email) и привязывает его к заказу.

## Модели

| Модель                | Файл                                                       |
| --------------------- | ---------------------------------------------------------- |
| `OrderModel`          | `src/app/models/order.model.ts`                            |
| `OrderProductModel`   | `src/app/models/order.model.ts`                            |
| `OrderCreateRequest`  | `src/app/models/orders/order-create-request.model.ts`      |
| `OrderProductRequest` | `src/app/models/orders/order-create-request.model.ts`      |
| `OrderFilters`        | `src/app/models/orders/order-filters.model.ts`             |
| `OrderIndexParams`    | `src/app/models/params/order-index.params.ts`              |
| `OrdersIndexResponse` | `src/app/models/responses/orders/orders-index.response.ts` |
| `OrdersShowResponse`  | `src/app/models/responses/orders/orders-index.response.ts` |

```ts
interface OrderModel {
    id: number;
    number: string;
    account: AccountModel | null;
    status: StatusModel | null;
    contact_phone: number | null;
    contact_email: string | null;
    contact_first_name: string | null;
    contact_last_name: string | null;
    contact_middle_name: string | null;
    comment: string | null;
    products: OrderProductModel[];
    total_count: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`OrderService` (`src/app/services/order.service.ts`), базовый путь `/orders/`.

| Метод    | HTTP | Путь           |
| -------- | ---- | -------------- |
| `index`  | GET  | `/orders/`     |
| `show`   | GET  | `/orders/{id}` |
| `create` | POST | `/orders/`     |
| `update` | PUT  | `/orders/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `account_id`, `product_id`, `date_from`, `date_to`.
- **Тело запроса (create/update):** `account_id`, `status_id`, `contact_phone`, `contact_email`, `contact_first_name`, `contact_last_name`, `contact_middle_name`, `comment`, `products[]` (`product_id`, `title`, `amount`, `count`).
- `total` позиции не передаётся — сервер считает `amount * count`.

## Зависимости

- `ListingComponent` (`app-listing`) — таблица, сортировка, пагинация, настройки колонок.
- `ProductsListFieldComponent` (`app-products-list-field`) — поиск и выбор товаров (вынесен из `receive-products-search`).
- `AutocompleteAccountsFieldComponent` (`app-autocomplete-accounts-field`).
- `InputFieldComponent`, `TextareaFieldComponent`, `SelectFieldComponent`, `CounterFieldComponent`, `SkeletonComponent`.
- `PopupService`, `NotificationService`.
- `SettingService` — чтение настройки `order-default-price-id` для цены по умолчанию.
- `ProductService` — загрузка цен товара (`show`).
- `PhoneHelper` (`src/app/helpers/phone.helper.ts`).

## Известные ограничения

- Позиции заказа с `product_id = null` (товар удалён) не попадают в едитор при редактировании — они отбрасываются при загрузке.
- При обновлении позиции пересоздаются полностью (старые удаляются, `id` меняются).
- Номер заказа генерируется на бэкенде (`ORD-YYYYMMDD-0001`), в едиторе не редактируется.
