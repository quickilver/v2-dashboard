# Модуль «Задачи» (tasks)

Kanban-доска задач. На текущем этапе реализованы колонки доски — они же группы задач (`task_group`).

## Расположение

```
src/app/components/modules/tasks/
├── tasks-board/          # kanban-доска
│   ├── tasks-board.ts
│   ├── tasks-board.html
│   └── tasks-board.scss
└── task-group-editor/    # попап создания/редактирования колонки
    ├── task-group-editor.ts
    └── task-group-editor.html
```

## Маршрут

| Путь     | Компонент             |
| -------- | --------------------- |
| `/tasks` | `TasksBoardComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Задачи» приходит из `ModuleSeeder` на бэкенде (`/tasks/`).

## Компоненты

### `TasksBoardComponent`

Селектор `app-tasks-board`. Kanban-доска: горизонтальный список колонок.

- **Состояние (signals):** `groups: TaskGroupModel[]`, `loading`.
- **Методы:**
    - `loadGroups()` — `TaskGroupService.index({ per_page: 100, sort: 'position', direction: 'asc' })`;
    - `createGroup()` — открывает попап `TaskGroupEditorComponent` с предзаполненной `position` (последняя + 1);
    - `editGroup(group)` — попап с `id` колонки;
    - `deleteGroup(group)` — подтверждение через `ConfirmService`, затем `TaskGroupService.delete()`.
- **Разметка:** заголовок «Задачи» с кнопкой «Добавить колонку», колонки с названием и кнопками редактирования/удаления, кнопка добавления колонки в конце доски, пустое состояние.
- **Скролл:** прокручивается только сама доска (`.board`, `overflow-x: auto`), страница не скроллится. Компонент занимает всю оставшуюся ширину и высоту контента (`:host` — `width: 100%`, `height: calc(100vh - 40px)`, `overflow: hidden`).

### `TaskGroupEditorComponent`

Селектор `app-task-group-editor`. Попап создания/редактирования колонки.

- **Вход:** `id: number | null`.
- **Модели:** `title`, `position`.
- **Методы:** `onSave()`, `onCancel()`.
- **Валидация:** пустое название не сохраняется (уведомление об ошибке).

## Модели

| Модель                     | Файл                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| `TaskGroupModel`           | `src/app/models/task-group.model.ts`                                  |
| `TaskGroupIndexParams`     | `src/app/models/params/task-group-index.params.ts`                    |
| `TaskGroupsIndexResponse`  | `src/app/models/responses/task-groups/task-groups-index.response.ts`  |
| `TaskGroupsShowResponse`   | `src/app/models/responses/task-groups/task-groups-show.response.ts`   |
| `TaskGroupsCreateResponse` | `src/app/models/responses/task-groups/task-groups-create.response.ts` |
| `TaskGroupsUpdateResponse` | `src/app/models/responses/task-groups/task-groups-update.response.ts` |

```ts
interface TaskGroupModel {
    id: number;
    title: string;
    position: number;
    tasks_count?: number;
    created_at: string;
    updated_at: string;
}
```

## Сервис

`TaskGroupService` (`src/app/services/task-group.service.ts`), базовый путь `/task-groups/`.

| Метод    | HTTP   | Путь                |
| -------- | ------ | ------------------- |
| `index`  | GET    | `/task-groups/`     |
| `show`   | GET    | `/task-groups/{id}` |
| `create` | POST   | `/task-groups/`     |
| `update` | PUT    | `/task-groups/{id}` |
| `delete` | DELETE | `/task-groups/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

## Зависимости

- `SkeletonComponent`, `IconComponent`, `InputFieldComponent`.
- `PopupService`, `ConfirmService`, `NotificationService`.

## Известные ограничения

- Задачи (`Task`) на доске ещё не отображаются — только колонки.
- Перетаскивание колонок и задач (drag & drop) не реализовано.
- Порядок колонок задаётся полем `position` через попап, отдельного drag-сортировщика нет.
