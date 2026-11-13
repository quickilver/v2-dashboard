# Модули админки

Документация по каждому модулю `src/app/components/modules/`.

| Модуль            | Сущность     | Маршрут               | Документ                         |
| ----------------- | ------------ | --------------------- | -------------------------------- |
| Каталог (лендинг) | —            | `/catalog`            | [catalog.md](./catalog.md)       |
| Товары            | `products`   | `/catalog/products`   | [products.md](./products.md)     |
| Категории         | `categories` | `/catalog/categories` | [categories.md](./categories.md) |
| Характеристики    | `attributes` | `/catalog/attributes` | [attributes.md](./attributes.md) |
| Склады            | `stores`     | `/catalog/stores`     | [stores.md](./stores.md)         |
| Цены              | `prices`     | `/catalog/prices`     | [prices.md](./prices.md)         |
| Закупка (лендинг) | —            | `/purchasing`         | [purchasing.md](./purchasing.md) |
| Контрагенты       | `suppliers`  | `/suppliers`          | [suppliers.md](./suppliers.md)   |
| Поступления       | `receives`   | `/receives`           | [receives.md](./receives.md)     |
| Заказы            | `orders`     | `/orders`             | [orders.md](./orders.md)         |
| Статусы           | `statuses`   | `/orders/statuses`    | [statuses.md](./statuses.md)     |
| Клиенты           | `accounts`   | `/accounts`           | [accounts.md](./accounts.md)     |
| Контент (лендинг) | —            | `/content`            | [content.md](./content.md)       |
| Страницы          | `pages`      | `/content/pages`      | [pages.md](./pages.md)           |
| Менеджеры         | `users`      | `/team/users`         | [users.md](./users.md)           |
| Задачи            | `tasks`      | `/team/tasks`         | [tasks.md](./tasks.md)           |
| Отчёты            | `reports`    | `/reports`            | [reports.md](./reports.md)       |
| Настройки         | `settings`   | `/settings`           | [settings.md](./settings.md)     |
| Логи              | `logs`       | `/logs`               | [logs.md](./logs.md)             |
| Бэкапы            | `backups`    | `/backups`            | [backups.md](./backups.md)       |

## Структура документа модуля

Каждый файл описывает:

1. **Назначение** — что делает модуль.
2. **Расположение** — дерево файлов модуля.
3. **Маршрут** — путь и компонент из `src/app/app.routes.ts`.
4. **Компоненты** — селектор, входы/выходы, модели, состояние (signals), методы.
5. **Модели** — таблица файлов и ключевые интерфейсы.
6. **Сервис** — методы и HTTP-эндпоинты.
7. **Зависимости** — переиспользуемые компоненты и сервисы.
8. **Известные ограничения** — если есть.

## Общие сведения

- Правила кода и стек — [AGENTS.md](../../AGENTS.md).
- Гайд для нейроагентов — [docs/agents.md](../agents.md).
- Эндпоинты и авторизация — [docs/api.md](../api.md).
