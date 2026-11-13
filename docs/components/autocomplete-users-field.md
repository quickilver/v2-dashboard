# Компонент `AutocompleteUsersFieldComponent`

## Назначение

Автокомплит по пользователям. После выбора инпут скрывается, вместо него
показывается чип с именем выбранного пользователя; клик по чипу сбрасывает выбор.

## Расположение

```
src/app/components/fields/autocomplete-users-field/
├── autocomplete-users-field.ts
├── autocomplete-users-field.html
└── autocomplete-users-field.scss
```

## Селектор и входы

Селектор `app-autocomplete-users-field`, standalone, `OnPush`.

| Вход/выход    | Тип                        | Назначение                           |
| ------------- | -------------------------- | ------------------------------------ |
| `label`       | `string`                   | Подпись над полем                    |
| `placeholder` | `string`                   | Плейсхолдер инпута                   |
| `search`      | `model<string>`            | Текст поиска (`[(search)]`)          |
| `value`       | `model<UserShort \| null>` | Выбранный пользователь (`[(value)]`) |

## Логика

Компонент наследует `AutocompleteBaseComponent<UserShort>` — поиск, debounce,
клавиатурная навигация и закрытие по клику вне компонента реализованы в базе
(см. [autocomplete-base.md](./autocomplete-base.md)).

- `filteredItems` — фильтрация загруженных пользователей по имени;
- `fetchItems(query)` — `UserService.index({ query, per_page: 10 })`;
- `selectItem(user)` — записывает `value`, **очищает `search`** и закрывает меню;
- `clear()` — сбрасывает `value` и `search`, возвращая инпут.

## Шаблон и стили

- Если `value()` задан — рендерится кнопка `.selected-chip` с именем и крестиком;
  инпут не отображается.
- Иначе — инпут с выпадающим списком (`.autocomplete-menu`), состояния
  «Загрузка...» и «Ничего не найдено».
- Чип: фон `$primary-light-color`, рамка `$primary-color`; при hover — заливка
  `$primary-color` и белый текст.

Общие стили автокомплитов (`.autocomplete-wrapper`, `.autocomplete-menu`,
`.autocomplete-item`) лежат в `src/styles/_fields.scss`; в компонентном SCSS
остались только правила чипа.

## Использование

```html
<app-autocomplete-users-field
    label="Менеджер"
    placeholder="Поиск менеджера"
    [search]="managerSearch()"
    (searchChange)="managerSearch.set($event)"
    [value]="selectedManager()"
    (valueChange)="onManagerChange($event)"
/>
```

## Известные ограничения

- Поиск выполняется на сервере по каждому вводу без debounce.
- Загружается не более 10 записей на запрос.
