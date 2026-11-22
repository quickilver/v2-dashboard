# Модуль «Отчёты» (reports)

Отчёты по данным магазина: отчёт по продажам и отчёт по поступлениям с фильтрами.

## Расположение

```
src/app/components/modules/reports/
├── order-reports/              # страница отчёта по продажам
│   ├── order-reports.ts
│   ├── order-reports.html
│   └── order-reports.scss
├── order-reports-filters/      # панель фильтров отчёта по продажам
│   ├── order-reports-filters.ts
│   ├── order-reports-filters.html
│   └── order-reports-filters.scss
├── receive-reports/            # страница отчёта по поступлениям
│   ├── receive-reports.ts
│   ├── receive-reports.html
│   └── receive-reports.scss
└── receive-reports-filters/    # панель фильтров отчёта по поступлениям
    ├── receive-reports-filters.ts
    ├── receive-reports-filters.html
    └── receive-reports-filters.scss
```

## Маршруты

| Путь                | Компонент                 |
| ------------------- | ------------------------- |
| `/reports`          | `ReportsPageComponent`    |
| `/reports/orders`   | `OrderReportsComponent`   |
| `/reports/receives` | `ReceiveReportsComponent` |

Определены в `src/app/app.routes.ts`. Страница `/reports` — лендинг с карточками-ссылками
на `/reports/orders` и `/reports/receives`.

## Компоненты

### `OrderReportsComponent`

Селектор `app-order-reports`. Страница отчёта по продажам.

- **Состояние (signals):**
    - `filters: OrderReportFilters` — текущие фильтры; по умолчанию период
      «последняя неделя»: `date_from` = сегодня − 6 дней, `date_to` = сегодня
      (формат `DD.MM.YYYY`);
    - `orders: OrderModel[]` — заказы по фильтрам;
    - `loading` — идёт загрузка;
    - `exporting` — идёт выгрузка в Excel;
    - `collapsedDays: Record<string, boolean>` — свёрнутые дни.
- **Computed:**
    - `days: OrderReportDay[]` — заказы, сгруппированные по дням (сортировка по
      убыванию даты), с суммами `totalPrice` и `totalCount` по дню;
    - `totalPrice`, `totalCount` — итоги по всей выборке.
- **Методы:**
    - `loadOrders()` — `OrderService.index({ per_page: 100, sort: 'created_at', direction: 'desc', account_id, date_from, date_to })`;
    - `onFiltersChange(filters)` — сохраняет фильтры и перезагружает заказы;
    - `openOrder(order)` — открывает попап `OrdersEditorComponent` с `id` заказа и перезагружает отчёт после закрытия;
    - `exportToExcel()` — `ReportService.exportOrders(filters)` → скачивание `orders-report-{YYYY-MM-DD}.xlsx`;
    - `toggleDay(date)` / `isCollapsed(date)` — сворачивание/разворачивание дня.
      По умолчанию развёрнут только первый (самый свежий) день, остальные свёрнуты;
      ручные переключения хранятся в `collapsedDays` и переопределяют это правило;
    - `formatPrice()`, `formatTime()`, `accountName()` — форматирование вывода;
    - `toApiDate()` — `DD.MM.YYYY` → `YYYY-MM-DD`;
    - `defaultFilters()` — период по умолчанию (неделя от текущей даты);
    - `toDisplayDate()` — `Date` → `DD.MM.YYYY`.
- **Разметка:** заголовок, панель фильтров, сводка (заказов / товаров / сумма),
  список дней. Каждый день — сворачиваемая секция с таблицей заказов
  (время, номер, покупатель, статус, товаров, сумма). Номер заказа — кнопка,
  открывающая заказ в попапе.

### `OrderReportsFiltersComponent`

Селектор `app-order-reports-filters`. Панель фильтров (ширина 300px).

- **Модели:** `filters: OrderReportFilters`, `selectedManager: UserShort | null`,
  `selectedAccount: AccountModel | null`.
- **Состояние:** `managerSearch: string`, `accountSearch: string`.
- **Методы:**
    - `onDateFromChange()`, `onDateToChange()` — даты в формате `DD.MM.YYYY`;
    - `onManagerChange(user)` — сохраняет `manager_id` из выбранного пользователя;
    - `onAccountChange()` — сохраняет `account_id`;
    - `resetAccount()` — сбрасывает выбранного покупателя.

**Поля фильтров:**

| Поле       | Компонент                         | Ключ фильтра |
| ---------- | --------------------------------- | ------------ |
| Дата от    | `app-calendar-field`              | `date_from`  |
| Дата до    | `app-calendar-field`              | `date_to`    |
| Менеджер   | `app-autocomplete-users-field`    | `manager_id` |
| Покупатель | `app-autocomplete-accounts-field` | `account_id` |

Раскладка — сетка в 2 колонки (`grid-template-columns: repeat(2, minmax(0, 1fr))`),
кнопка сброса покупателя занимает всю ширину (`grid-column: 1 / -1`). На экранах
уже 700px сетка становится одноколоночной.

### `ReceiveReportsComponent`

Селектор `app-receive-reports`. Страница отчёта по поступлениям — построена по образцу
`OrderReportsComponent`.

- **Состояние (signals):**
    - `filters: ReceiveReportFilters` — по умолчанию последние 7 дней
      (`date_from` = сегодня − 6 дней, `date_to` = сегодня, формат `DD.MM.YYYY`);
    - `receives: ReceiveModel[]` — поступления по фильтрам;
    - `loading`, `exporting` — загрузка и выгрузка;
    - `collapsedDays: Record<string, boolean>` — свёрнутые дни;
    - `expandedProducts: Record<number, boolean>` — раскрытые списки товаров.
- **Computed:**
    - `days: ReceiveReportDay[]` — поступления, сгруппированные по дням
      (по убыванию даты), с итогами `totalPrice` / `totalCount`;
    - `totalPrice`, `totalCount` — итоги по выборке.
- **Методы:**
    - `loadReceives()` — `ReceiveService.index({ per_page: 100, sort: 'created_at', direction: 'desc', store_id, supplier_id, user_id, date_from, date_to })`;
    - `onFiltersChange(filters)` — сохраняет фильтры и перезагружает данные;
    - `openReceive(receive)` — открывает попап `ReceivesEditorComponent` и перезагружает отчёт после закрытия;
    - `exportToExcel()` — `ReportService.exportReceives(filters)` → `receives-report-{YYYY-MM-DD}.xlsx`;
    - `toggleDay()` / `isCollapsed()`, `toggleProducts()` / `isProductsExpanded()` — сворачивание;
    - `formatPrice()`, `formatTime()` — форматирование вывода.
- **Разметка:** сводка (поступлений / товаров / сумма), список дней с таблицей
  (время, номер, склад, контрагент, менеджер, товаров, сумма). Номер поступления —
  кнопка, открывающая попап; по кнопке в колонке «Товаров» раскрывается список позиций.

### `ReceiveReportsFiltersComponent`

Селектор `app-receive-reports-filters`. Панель фильтров (сетка 2 колонки).

| Поле       | Компонент                          | Ключ фильтра  |
| ---------- | ---------------------------------- | ------------- |
| Дата от    | `app-calendar-field`               | `date_from`   |
| Дата до    | `app-calendar-field`               | `date_to`     |
| Склад      | `app-select-field`                 | `store_id`    |
| Менеджер   | `app-autocomplete-users-field`     | `user_id`     |
| Контрагент | `app-autocomplete-suppliers-field` | `supplier_id` |

Склады загружаются через `StoreService.index({ per_page: 100 })` в `ngOnInit`.

## Модели

`OrderReportFilters` — `src/app/models/reports/order-report-filters.model.ts`:

```ts
interface OrderReportFilters {
    date_from: string;
    date_to: string;
    manager_id: number | null;
    account_id: number | null;
}
```

`ReceiveReportFilters` — `src/app/models/reports/receive-report-filters.model.ts`:

```ts
interface ReceiveReportFilters {
    date_from: string;
    date_to: string;
    store_id: number | null;
    supplier_id: number | null;
    user_id: number | null;
}
```

`ReceiveReportDay` — `src/app/models/reports/receive-report-day.model.ts`:

```ts
interface ReceiveReportDay {
    date: string; // YYYY-MM-DD
    label: string;
    receives: ReceiveModel[];
    totalPrice: number;
    totalCount: number;
}
```

`OrderReportDay` — `src/app/models/reports/order-report-day.model.ts`:

```ts
interface OrderReportDay {
    date: string; // YYYY-MM-DD
    label: string; // «13 ноября 2026 г., четверг»
    orders: OrderModel[];
    totalPrice: number;
    totalCount: number;
}
```

## Зависимости

- `CalendarFieldComponent`, `AutocompleteUsersFieldComponent`,
  `AutocompleteAccountsFieldComponent`.
- `OrderService` — заказы по фильтрам.
- `ReceiveService` — поступления по фильтрам.
- `StoreService` — список складов для фильтра.
- `ReportService` — экспорт в XLSX (`GET /reports/orders/export`, `GET /reports/receives/export`).
- `PopupService` — попапы заказа (`OrdersEditorComponent`) и поступления (`ReceivesEditorComponent`).
- `UserService` — поиск менеджеров (внутри `app-autocomplete-users-field`).
- `NotificationService` — ошибки загрузки.
- `SkeletonComponent`, `IconComponent`.

## Известные ограничения

- Загружается не более 100 заказов/поступлений (`per_page: 100`), пагинации в отчётах нет.
- Фильтр «Менеджер» собирается в состояние, но не передаётся в API: у заказов
  нет поля менеджера (`orders` не содержит `user_id`).
- Экспорт в Excel выгружает все заказы/поступления по фильтру без пагинации.
- Пункт меню «Отчёты» в `ModuleSeeder` на бэкенде пока не создан.
