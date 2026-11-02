# Модуль «Категории» (categories)

Дерево категорий каталога: просмотр, создание, редактирование, удаление и смена родителя.

## Расположение

```
src/app/components/modules/categories/
├── categories-listing/     # страница с деревом категорий
│   ├── categories-listing.ts
│   ├── categories-listing.html
│   └── categories-listing.scss
└── categories-editor/      # попап создания/редактирования (2 таба)
    ├── categories-editor.ts
    ├── categories-editor.html
    └── categories-editor.scss
```

## Маршрут

| Путь                  | Компонент                    |
| --------------------- | ---------------------------- |
| `/catalog/categories` | `CategoriesListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Каталог → Категории» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `CategoriesListingComponent`

Селектор `app-categories-listing`. Тонкая обёртка: заголовок «Категории» и дерево `app-categories-tree` в режиме редактирования.

- **Шаблон:** `<app-categories-tree [parentId]="0" [editable]="true" />`.
- **Логика:** отсутствует — всё поведение (загрузка, создание, редактирование, удаление, drag-порядок) реализовано в `CategoriesTreeComponent`.

### `CategoriesEditorComponent`

Селектор `app-categories-editor`. Едитор категории в попапе с классом `with-tabs`.

- **Входы:** `id: number | null` (редактирование), `parentId: number` (предзаполнение родителя при создании из узла дерева).
- **Табы:** `info` («Информация») и `parent` («Родительская категория»).
- **Модели полей:** `guid`, `title`, `alias`, `display`, `position`, `parent`.
- **Состояние (signals):** `isEditMode`, `loading`, `saving`, `tab`, `ancestors: CategoryAncestor[]`; computed `ancestorIds` — id предков, которые нельзя выбрать родителем (защита от циклов).
- **Методы:** `loadCategory()`, `onSave()`, `onCancel()`, `isActiveTab()`, `changeTab()`.
- **Сохранение:** `Partial<Category>` (`guid`, `title`, `alias`, `parent_id`, `display`, `position`) → `create()` / `update()` → `PopupService.resolve()`.

## Дерево категорий

`CategoriesTreeComponent` (`src/app/components/categories-tree/`) — переиспользуемый компонент, используется в листинге категорий, в едиторе категории (выбор родителя) и в фильтрах товаров.

- **Входы:** `selectable`, `editable`, `multiple`, `parentId`, `ancestors: number[]`.
- **Модели:** `value: number | number[] | null` (выбранные id), `selectedPaths: number[][]`.
- **Состояние:** `nodes: CategoryTreeNodeModel[]`, `loading`, `loaded`.
- **Загрузка:** `CategoriesService.index({ parent_id, per_page: 100, sort: 'position', direction: 'desc' })`; дочерние узлы подгружаются лениво при раскрытии.
- **Режим `editable`:** контекстное меню узла (`DropdownFieldComponent`) с действиями «Создать», «Редактировать», «Удалить»; открывает `CategoriesEditorComponent` через `PopupService`.

## Модели

| Модель                    | Файл                                                               |
| ------------------------- | ------------------------------------------------------------------ |
| `Category`                | `src/app/models/category.model.ts`                                 |
| `CategoryAncestor`        | `src/app/models/category-ancestor.model.ts`                        |
| `CategoryTreeNodeModel`   | `src/app/models/category-tree-node.model.ts`                       |
| `CategoryIndexParams`     | `src/app/models/params/category-index.params.ts`                   |
| `CategoriesIndexResponse` | `src/app/models/responses/categories/categories-index.response.ts` |

```ts
interface Category {
    id: number;
    guid: string;
    title: string;
    alias: string;
    parent_id: number | null;
    display: boolean;
    position: number;
    ancestors?: CategoryAncestor[];
    created_at: string;
    updated_at: string;
}
```

## Сервис

`CategoriesService` (`src/app/services/categories.service.ts`), базовый путь `/categories/`.

| Метод    | HTTP   | Путь               |
| -------- | ------ | ------------------ |
| `index`  | GET    | `/categories/`     |
| `show`   | GET    | `/categories/{id}` |
| `create` | POST   | `/categories/`     |
| `update` | PUT    | `/categories/{id}` |
| `delete` | DELETE | `/categories/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `parent_id` (пустая строка = корневые).

## Зависимости

- `CategoriesTreeComponent` — дерево.
- `InputFieldComponent`, `CheckboxFieldComponent` — поля формы.
- `SkeletonComponent`, `PopupService`, `ConfirmService`, `NotificationService`.

## Где используется

- `ProductsFiltersComponent` — фильтр товаров по категориям (`selectable`, `multiple`).
- `PopupProductFieldComponent` — дерево категорий в попапе выбора товаров.
