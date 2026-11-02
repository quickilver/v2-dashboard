# Модуль «Страницы» (pages)

Управление статическими страницами сайта: название, алиас, H1, SEO-поля и HTML-контент.

## Расположение

```
src/app/components/modules/pages/
├── pages-listing/     # таблица-список страниц
│   ├── pages-listing.ts
│   ├── pages-listing.html
│   └── pages-listing.scss
└── pages-editor/      # попап создания/редактирования (3 таба)
    ├── pages-editor.ts
    ├── pages-editor.html
    └── pages-editor.scss
```

## Маршрут

| Путь             | Компонент               |
| ---------------- | ----------------------- |
| `/content/pages` | `PagesListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Контент → Страницы» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `PagesListingComponent`

Селектор `app-pages-listing`. Таблица на базе `ListingComponent`.

- **Колонки:** `id`, `title`, `alias`, `display` (`type: 'boolean'`).
- **Состояние (signals):** `pages: PageModel[]`, `loading`, `meta`, `pageSize` (50), `page` (1).
- **Приватные поля:** `currentSearch`, `currentSort`, `currentDirection`.
- **Методы:** `loadPages()`, `onCreate()`, `onRowClick()`, `onEdit()`, `onDelete()`, `onSearch()`, `onSort()`, `onPageChange()`.
- **Открытие едитора:** `PopupService.open('Создание страницы' | 'Редактирование страницы', PagesEditorComponent, { id }, 'with-tabs')`.
- **Особенность:** создание реализовано отдельным методом `onCreate()` (а не `createClick()`), поэтому в шаблоне используется `(createClick)="onCreate()"`.

### `PagesEditorComponent`

Селектор `app-pages-editor`. Едитор страницы в попапе с классом `with-tabs`.

- **Вход:** `id: number | null`.
- **Табы:** `info` («Информация»), `seo` («SEO»), `content` («Контент»).
- **Модели полей:** `title`, `alias`, `h1`, `display`, `seoTitle`, `seoDescription`, `seoKeywords`, `content`.
- **Состояние (signals):** `isEditMode`, `loading`, `saving`, `tab`.
- **Методы:** `loadPage()`, `onSave()`, `onCancel()`, `isActiveTab()`, `changeTab()`.
- **Сохранение:** `Partial<PageModel>`; пустые строки для `h1`, `seo_*` и `content` отправляются как `null`.

## Модели

| Модель               | Файл                                                     |
| -------------------- | -------------------------------------------------------- |
| `PageModel`          | `src/app/models/page.model.ts`                           |
| `PageIndexParams`    | `src/app/models/params/page-index.params.ts`             |
| `PagesIndexResponse` | `src/app/models/responses/pages/pages-index.response.ts` |
| `PagesShowResponse`  | `src/app/models/responses/pages/pages-show.response.ts`  |

```ts
interface PageModel {
    id: number;
    title: string;
    alias: string;
    h1: string | null;
    content: string | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string | null;
    display: boolean;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`PageService` (`src/app/services/page.service.ts`), базовый путь `/pages/`.

| Метод    | HTTP   | Путь          |
| -------- | ------ | ------------- |
| `index`  | GET    | `/pages/`     |
| `show`   | GET    | `/pages/{id}` |
| `create` | POST   | `/pages/`     |
| `update` | PUT    | `/pages/{id}` |
| `delete` | DELETE | `/pages/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

## Зависимости

- `ListingComponent`, `InputFieldComponent`, `CheckboxFieldComponent`, `WyswigFieldComponent`, `SkeletonComponent`.
- `PopupService`, `ConfirmService`, `NotificationService`.

## Особенности

- Контент редактируется через `app-wyswig-field` (WYSIWYG с поддержкой медиа и AI-результата).
- Таб «Контент» использует класс `editor-body--full` — редактор растягивается на всю высоту попапа.
