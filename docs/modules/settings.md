# Модуль «Настройки» (settings)

Просмотр и редактирование настроек приложения. Настройки сгруппированы по полю `group`, тип поля определяется полем `type`.

## Расположение

```
src/app/components/modules/settings/
└── settings-listing/     # список настроек, сгруппированный по group
    ├── settings-listing.ts
    ├── settings-listing.html
    └── settings-listing.scss
```

## Маршрут

| Путь        | Компонент                  |
| ----------- | -------------------------- |
| `/settings` | `SettingsListingComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Настройки» приходит из `ModuleSeeder` на бэкенде.

## Компоненты

### `SettingsListingComponent`

Селектор `app-settings-listing`. Не использует `ListingComponent` — настройки выводятся списком групп.

- **Вход:** `allSettings: SettingModel[]` (не используется в текущей реализации).
- **Состояние (signals):** `settings: SettingModel[]`, `groups: SettingGroupModel[]`, `loading`, `saving`, `draftValues: Record<number, string | null>`.
- **Computed:** `groupedSettings` — настройки, сгруппированные по `group_id` с сохранением порядка групп.
- **Методы:**
    - `loadSettings()` — `SettingService.index({ per_page: 100 })` + `SettingGroupService.index()`;
    - `onValueChange(setting, value)` — запоминает изменённое значение в `draftValues` (если значение вернулось к исходному — запись удаляется);
    - `onSave()` — сохраняет только изменённые настройки через `SettingService.update()`, затем обновляет локальное состояние и очищает `draftValues`.
- **Шаблон:**
    - для каждой группы выводится заголовок и блок с настройками;
    - каждая настройка рендерится через `app-setting-field` с `title`, `type`, `value`, `alias`, `options` и обработчиком `(valueChange)`;
    - `type === 'checkbox'` → значение `'1'` или `'true'` трактуется как `true`;
    - кнопка «Сохранить» блокируется на время запроса и показывает «Сохранение...»;
    - пустое состояние — «Нет настроек».

> Значения сохраняются в строковом виде: `checkbox` → `'1'` / `'0'`, пустая строка → `null`.

### `SettingFieldComponent`

Селектор `app-setting-field` (`src/app/components/fields/setting-field/`). Универсальное поле настройки.

- **Входы:** `title`, `type: 'text' | 'checkbox'`, `alias`, `options`.
- **Модель:** `value: string | number | boolean`.
- **Computed:** `textValue` — приводит значение к `string | number` для текстового инпута.
- **Шаблон:** `@switch (type())` — `text` → `app-input-field`, `checkbox` → `app-checkbox-field`.

## Модели

| Модель                  | Файл                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `SettingModel`          | `src/app/models/setting.model.ts`                              |
| `SettingIndexParams`    | `src/app/models/params/setting-index.params.ts`                |
| `SettingsIndexResponse` | `src/app/models/responses/settings/settings-index.response.ts` |

```ts
interface SettingModel {
    id: number;
    title: string;
    alias: string;
    type: string;
    group: string | null;
    options: any | null;
    value: string | null;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`SettingService` (`src/app/services/setting.service.ts`), базовый путь `/settings/`.

| Метод    | HTTP   | Путь             |
| -------- | ------ | ---------------- |
| `index`  | GET    | `/settings/`     |
| `show`   | GET    | `/settings/{id}` |
| `create` | POST   | `/settings/`     |
| `update` | PUT    | `/settings/{id}` |
| `delete` | DELETE | `/settings/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `group`.

## Зависимости

- `SettingFieldComponent` → `InputFieldComponent`, `CheckboxFieldComponent`.
- `NotificationService`.

## Известные ограничения

- Изменённые настройки сохраняются только по кнопке «Сохранить» — автосохранения нет.
- `options` (`any | null`) не используется при рендере — селекты/мультиселекты не поддерживаются.
