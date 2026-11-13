# Модуль «Отчёты» (reports)

Отчёты по данным магазина. Пока реализован только отчёт по продажам с фильтрами.

## Расположение

```
src/app/components/modules/reports/
├── order-reports/            # страница отчёта по продажам
│   ├── order-reports.ts
│   ├── order-reports.html
│   └── order-reports.scss
└── order-reports-filters/    # панель фильтров отчёта
    ├── order-reports-filters.ts
    ├── order-reports-filters.html
    └── order-reports-filters.scss
```

## Маршруты

| Путь              | Компонент               |
| ----------------- | ----------------------- |
| `/reports`        | `ReportsPageComponent`  |
| `/reports/orders` | `OrderReportsComponent` |

Определены в `src/app/app.routes.ts`. Страница `/reports` — лендинг с табами
(`app-tabs-field`); на табе «Продажи» есть ссылка на `/reports/orders`.

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
- `ReportService` — экспорт в XLSX (`GET /reports/orders/export`).
- `PopupService` — попап заказа (`OrdersEditorComponent`).
- `UserService` — поиск менеджеров (внутри `app-autocomplete-users-field`).
- `NotificationService` — ошибки загрузки.
- `SkeletonComponent`, `IconComponent`.

## Известные ограничения

- Загружается не более 100 заказов (`per_page: 100`), пагинации в отчёте нет.
- Фильтр «Менеджер» собирается в состояние, но не передаётся в API: у заказов
  нет поля менеджера (`orders` не содержит `user_id`).
- Экспорт в Excel выгружает все заказы по фильтру без пагинации.
- Пункт меню «Отчёты» в `ModuleSeeder` на бэкенде пока не создан.
