# Страница «Отчёты» (reports)

## Назначение

Раздел построения отчётов. Пока содержит только переключатель разделов
(`app-tabs-field`) и заглушку контента.

## Расположение

```
src/app/pages/reports/
├── reports.ts
├── reports.html
└── reports.scss
```

## Маршрут

| Путь       | Компонент              |
| ---------- | ---------------------- |
| `/reports` | `ReportsPageComponent` |

Определён в `src/app/app.routes.ts`.

## Компонент `ReportsPageComponent`

Селектор `app-reports-page`, standalone, `OnPush`.

- `tabs: TabsFieldOption[]` — «Продажи», «Закупки», «Склад», «Клиенты»;
- `activeTab = signal<string | number | null>('sales')` — активный раздел.

## Шаблон

- Заголовок «Отчёты» и подзаголовок.
- `app-tabs-field` с `[(value)]="activeTab"`.
- На табе «Продажи» — карточка-ссылка на `/reports/orders`; на остальных табах —
  заглушка «Раздел в разработке».

## Зависимости

- `TabsFieldComponent` — см. [tabs-field.md](../components/tabs-field.md).
- `IconComponent`, `RouterLink`.

## Известные ограничения

- API отчётов отсутствует: данные не загружаются, экспорт в XLSX не реализован.
- Пункт меню «Отчёты» в `ModuleSeeder` на бэкенде пока не создан.
