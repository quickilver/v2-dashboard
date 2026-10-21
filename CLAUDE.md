# Инструкции для нейросетей (Angular Project)

## Общие правила
- Отвечай на русском языке.
- Используй логические названия переменных, избегая односимвольных переменных.
- Всегда указывай тип данных у создаваемых переменных.
- Не добавляй комментарии к очевидному коду; комментируй только неочевидные решения.

## Стек
- **Angular 21** (standalone-компоненты, без NgModule).
- **TypeScript 5.9**, режим `strict` + `strictTemplates`.
- **SSR** через `@angular/ssr` + Express.
- **Тесты:** Vitest (`ng test`).
- **Форматирование:** Prettier (`npm run refactor`).
- **Пакетный менеджер:** npm 10. Node v22.

## Команды
```bash
npm start          # ng serve — локальный сервер разработки
npm run build      # продакшн-сборка
npm run watch      # сборка в режиме watch (development)
npm test           # запуск тестов (Vitest)
npm run refactor   # форматирование Prettier по src/**
```

## Архитектура
- Точка входа: `src/main.ts` (браузер), `src/main.server.ts` + `src/server.ts` (SSR).
- Конфигурация приложения: `src/app/app.config.ts` (роутер, HttpClient, гидратация, интерцепторы).
- Маршруты: `src/app/app.routes.ts`.
- Корневой компонент: `src/app/app.ts` (`App`), подключает `LayoutComponent`, `LoginComponent`, `ConfirmComponent`, `PopupComponent`, `NotificationComponent`.

### Структура `src/app/`
- `components/` — UI-компоненты:
  - `layout/` — общий каркас (навигация, шапка);
  - `listing/` — переиспользуемая таблица-листинг;
  - `fields/` — поля форм (input, dropdown, calendar, checkbox, autocomplete, wysiwyg и др.);
  - `modules/` — модули админки (products, stores, prices, categories, attributes, users, settings, pages);
  - `file-manager/`, `popup/`, `confirm/`, `notification/`, `navigation/`, `icon/`, `categories-tree/`, `user-info/`.
- `pages/` — страницы верхнего уровня (`homepage`, `login`).
- `services/` — сервисы данных (по одному на сущность API).
- `models/` — интерфейсы и типы (`*.model.ts`, `params/`, `responses/`).
- `interceptors/` — HTTP-интерцепторы (`auth.interceptor.ts`).

## Конвенции кода
- **Компоненты:** `standalone: true`, `ChangeDetectionStrategy.OnPush`, `inject()` вместо конструктора.
- **Состояние:** Angular Signals (`signal`, `computed`) — основной способ хранения состояния.
- **Асинхронность:** сервисы возвращают `Promise` через `firstValueFrom(...)`; компоненты используют `async/await`.
- **Именование файлов:** `kebab-case` (`products-listing.ts`), классы — `PascalCase` (`ProductsListingComponent`).
- **Селекторы:** префикс `app-` (`app-products-listing`).
- **Стили:** SCSS, общие переменные и миксины в `src/styles/` (`_variables.scss`, `_listing.scss`, `_fields.scss`, `_editor.scss`).
- **Типизация:** все переменные и параметры типизированы; избегай `any`.

## Работа с API
- Базовый URL: `environment.apiUrl` (`src/environments/environment.ts`).
- Авторизация: токен добавляется автоматически в `auth.interceptor.ts` (заголовок `Authorization`).
- Каждая сущность — отдельный сервис в `src/app/services/` с методами `index`, `show`, `create`, `update`, `delete`.
- Типы ответов — в `src/app/models/responses/`, параметры запросов — в `src/app/models/params/`.

## Документация
- Вся проектная документация хранится в папке `docs/`.
- Перед работой с API сверяйся с `docs/api.md` — там описаны все эндпоинты, базовый URL и авторизация.
- При добавлении или изменении эндпоинтов обновляй `docs/api.md`.
- Новые разделы документации создавай в виде отдельных MD-файлов в `docs/`.
