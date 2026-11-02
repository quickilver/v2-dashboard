# Модуль «Поступления» (receives)

Учёт поступлений товаров: листинг документов и едитор с двумя табами (форма и товары).

## Расположение

```
src/app/components/modules/receives/
├── receives-listing/          # листинг поступлений
│   ├── receives-listing.ts
│   ├── receives-listing.html
│   ├── receives-listing.scss
│   └── receive-row.model.ts
├── receives-editor/           # едитор поступления (2 таба)
│   ├── receives-editor.ts
│   ├── receives-editor.html
│   └── receives-editor.scss
├── receive-form/              # форма шапки (таб «Форма»)
│   ├── receive-form.ts
│   ├── receive-form.html
│   └── receive-form.scss
├── receive-products-search/   # поиск товаров (таб «Товары»)
│   ├── receive-products-search.ts
│   ├── receive-products-search.html
│   └── receive-products-search.scss
└── receive-products-list/     # таблица добавленных товаров
    ├── receive-products-list.ts
    ├── receive-products-list.html
    └── receive-products-list.scss
```

## Маршрут

| Путь        | Компонент                  |
| ----------- | -------------------------- |
| `/receives` | `ReceivesListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Поступления» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `ReceivesListingComponent`

Селектор `app-receives-listing`. Standalone-компонент с `ChangeDetectionStrategy.OnPush`, построен на переиспользуемом `app-listing`.

- **Колонки:** `ID`, `Склад`, `Контрагент`, `Менеджер`, `Кол-во`, `Сумма`, `Дата`.
- **Строка листинга (`ReceiveRow`)** хранит объекты `supplier: SupplierModel | null` и `user: UserShort | null` — ровно в том виде, в котором их отдаёт `ReceiveResource` (`supplier` → `SupplierResource`, `user` → `UserShortResource`). Отображение задаётся через `formatter` колонки (`row.supplier?.title`, `row.user?.name`).
- **Ссылки в ячейках:** `Контрагент` и `Менеджер` имеют `type: 'link'` — клик открывает `SuppliersEditorComponent` / `UsersEditorComponent` в попапе, не открывая поступление (`onCellClick`).
- **Состояние (signals):** `receives: ReceiveModel[]`, `rows` (computed, `ReceiveRow[]`), `loading`, `meta`, `pageSize` (50), `page`.
- **Методы:** `loadReceives()`, `onRowClick()`, `onEdit()`, `onCellClick()`, `onDelete()`, `createClick()`, `onSort()`, `onPageChange()`.
- **Открытие едитора:** `PopupService.open('Создание поступления' | 'Редактирование поступления', ReceivesEditorComponent, { id }, 'with-tabs')`; после закрытия попапа листинг перезагружается.
- **Удаление:** подтверждение через `ConfirmService`, затем `ReceiveService.delete()`.

### `ReceivesEditorComponent`

Селектор `app-receives-editor`. Едитор поступления в попапе с классом `with-tabs`.

- **Вход:** `id: number | null` — если передан, едитор работает в режиме редактирования и загружает данные через `ReceiveService.show(id)`.
- **Табы:** `form` («Форма») и `products` («Товары» с счётчиком добавленных товаров).
- **Состояние (signals):** `isEditMode`, `loading`, `saving`, `tab`, `products`, `counts`, `purchases`, `newPrices`.
- **Модели:** `storeId`, `priceId`, `supplier`, `payed`, `comment` — прокидываются в `app-receive-form`.
- **Методы:** `loadReceive()`, `onProductSelected()`, `onProductRemoved()`, `onSave()`, `onCancel()`, `isActiveTab()`, `changeTab()`.
- **Кнопка сохранения** недоступна, пока не выбраны склад, тип цены, контрагент и не добавлен хотя бы один товар (`canSubmit`).
- **Загрузка при редактировании:** из `receive.products` восстанавливаются `products`, `counts`, `purchases`, `newPrices`, а `priceId` берётся из `products[].price.id`.

### `ReceiveFormComponent`

Селектор `app-receive-form`. Форма шапки поступления (содержимое таба «Форма»).

- **Поля (models):**
    - `storeId: number | null` — селект складов (`app-select-field`), список из `StoreService.index({ per_page: 100 })`;
    - `priceId: number | null` — селект типов цен (`app-select-field`), список из `PriceService.index({ per_page: 100 })`;
    - `supplier: SupplierModel | null` — автокомплит контрагентов (`app-autocomplete-suppliers-field`);
    - `payed: number` — инпут «Сколько оплачено» (`app-input-field`, `type="number"`);
    - `comment: string` — текстареа «Комментарий» (`app-textarea-field`).
- **Состояние (signals):** `stores`, `prices`, `loading`, `storeOptions` (computed), `priceOptions` (computed).
- **Методы:** `loadStores()`, `loadPrices()`, `onPayedChange()`.

### `ReceiveProductsSearchComponent`

Селектор `app-receive-products-search`. Обёртка над `app-autocomplete-products-field` для выбора товара в поступлении.

- **Вход:** `placeholder: string` (по умолчанию «Поиск по названию или артикулу»).
- **Выход:** `productSelected: ProductIndex` — выбранный товар.
- **Методы:** `onValueChange()` — эмитит `productSelected` при выборе товара; `openCatalog()` — открывает попап `PopupProductFieldComponent` («Выбор товаров») и эмитит `productSelected` для каждого выбранного товара.

### `ReceiveProductsListComponent`

Селектор `app-receive-products-list`. Таблица добавленных в поступление товаров.

- **Вход:** `products: ProductIndex[]`.
- **Модели:** `counts: Record<number, number>` — количество по `id` товара (по умолчанию `1`), `purchases: Record<number, number>` — закупочная цена, `newPrices: Record<number, number>` — новая цена (`new_value`).
- **Выход:** `productRemoved: ProductIndex` — товар, который нужно убрать из поступления.
- **Колонки:** `ID`, `Название`, `Закуп` (`app-input-field` с `size="small"`), `Кол-во` (`app-counter-field` с `size="small"`, минимум 1), `Сумма` (закуп × кол-во), `Цена` (`app-input-field` с `size="small"` — новое значение цены), `Действия`.
- **Итоги (computed):** `totalCount`, `totalPrice`, `formattedTotalPrice` — выводятся в `tfoot`.
- **Пустое состояние:** «Товары не добавлены».

## Новые переиспользуемые поля

| Компонент                             | Селектор                           | Назначение                                                                                             |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `SelectFieldComponent`                | `app-select-field`                 | Нативный `<select>` с `label`, `placeholder`, `options: SelectOption[]`, `disabled`, `value`           |
| `AutocompleteSuppliersFieldComponent` | `app-autocomplete-suppliers-field` | Автокомплит контрагентов с серверным поиском, `value: SupplierModel \| null`                           |
| `PopupProductFieldComponent`          | `app-popup-product-field`          | Выбор товаров в попапе: слева дерево категорий, справа список товаров выбранной категории с чекбоксами |

## API и сохранение

Сущность поступлений реализована на бэкенде: `ReceiveController` (`/receives/`), модели `Receive`, `ReceiveProduct`.

| Метод    | HTTP   | Путь             |
| -------- | ------ | ---------------- |
| `index`  | GET    | `/receives/`     |
| `show`   | GET    | `/receives/{id}` |
| `create` | POST   | `/receives/`     |
| `update` | PUT    | `/receives/{id}` |
| `delete` | DELETE | `/receives/{id}` |

- **Тело запроса:**

```json
{
    "store_id": 1,
    "supplier_id": 3,
    "comment": "Поставка",
    "payed": 1500,
    "products": [
        { "product_id": 1, "price_id": 2, "count": 10, "purchase_price": 250, "new_value": 300 }
    ]
}
```

- `user_id` (менеджер) проставляется на бэкенде из авторизованного пользователя.
- `old_value` не передаётся с фронтенда: бэкенд резолвит его из текущей цены товара по `price_id`, применяет `new_value` и увеличивает остаток по `store_id`.
- Связи: `store` (склад), `supplier` (контрагент), `user` (менеджер), `products[].product` (товар), `products[].price` (тип цены).

### Сохранение из едитора

`ReceivesEditorComponent.onSave()` собирает `ReceiveCreateRequest` из состояния формы и таблицы, вызывает `ReceiveService.create()` или `ReceiveService.update()` и после успеха закрывает попап через `PopupService.resolve()`.

- **Модели:** `ReceiveModel`, `ReceiveProductModel` (`src/app/models/receive.model.ts`, `receive-product.model.ts`), `ReceiveCreateRequest`, `ReceiveProductRequest` (`src/app/models/receives/`).
- **Сервис:** `ReceiveService` (`src/app/services/receive.service.ts`).
- **Ответы:** `ReceivesIndexResponse`, `ReceivesShowResponse`, `ReceivesCreateResponse`, `ReceivesUpdateResponse` в `src/app/models/responses/receives/`.
