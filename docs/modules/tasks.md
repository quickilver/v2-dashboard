# Модуль «Задачи» (tasks)

Kanban-доска задач: колонки доски (группы задач) и сами задачи.

## Расположение

```
src/app/components/modules/tasks/
├── tasks-board/          # kanban-доска
│   ├── tasks-board.ts
│   ├── tasks-board.html
│   └── tasks-board.scss
├── task-group-editor/    # попап создания/редактирования колонки
│   ├── task-group-editor.ts
│   └── task-group-editor.html
└── task-editor/          # попап создания/редактирования задачи
    ├── task-editor.ts
    ├── task-editor.html
    └── task-editor.scss
```

## Маршрут

| Путь     | Компонент             |
| -------- | --------------------- |
| `/tasks` | `TasksBoardComponent` |

Определён в `src/app/app.routes.ts`. Пункт меню «Задачи» приходит из `ModuleSeeder` на бэкенде (`/tasks/`).

## Компоненты

### `TasksBoardComponent`

Селектор `app-tasks-board`. Kanban-доска: горизонтальный список колонок с задачами.

- **Состояние (signals):** `groups: TaskGroupModel[]`, `tasksByGroup: Record<number, TaskModel[]>`, `loading`.
- **Методы:**
    - `loadGroups()` — параллельно загружает колонки (`TaskGroupService.index`) и задачи (`TaskService.index`);
    - `tasksOf(group)` — задачи конкретной колонки;
    - `createGroup()` — открывает попап `TaskGroupEditorComponent` с предзаполненной `position` (последняя + 1);
    - `createTask(group)` — открывает попап `TaskEditorComponent` с `groupId` колонки (кнопка `.create-task`);
    - `editTask(task)` — попап `TaskEditorComponent` с `id` задачи (клик по карточке задачи);
    - `editGroup(group)` — попап с `id` колонки;
    - `deleteGroup(group)` — подтверждение через `ConfirmService`, затем `TaskGroupService.delete()`.
- **Разметка:** заголовок «Задачи» с кнопкой «Добавить колонку», колонки с названием, кнопкой создания задачи и списком карточек задач, кнопка добавления колонки в конце доски, пустые состояния.
- **Скролл:** прокручивается только сама доска (`.board`, `overflow-x: auto`), страница не скроллится. Компонент занимает всю оставшуюся ширину и высоту контента (`:host` — `width: 100%`, `height: calc(100vh - 40px)`, `overflow: hidden`).

### `TaskGroupEditorComponent`

Селектор `app-task-group-editor`. Попап создания/редактирования колонки.

- **Вход:** `id: number | null`.
- **Модели:** `title`, `position`.
- **Методы:** `onSave()`, `onCancel()`.
- **Валидация:** пустое название не сохраняется (уведомление об ошибке).

### `TaskEditorComponent`

Селектор `app-task-editor`. Попап создания/редактирования задачи.

- **Входы:** `id: number | null` (редактирование), `groupId: number | null` (колонка по умолчанию при создании).
- **Модели:** `taskGroupId`, `title`, `description`, `assigneeSearch`, `assignee: UserShort | null`, `startAt`, `finishAt`.
- **Методы:** `loadDictionaries()` (колонки + пользователи), `loadTask()`, `onAssigneeSelect()`, `onSave()`, `onCancel()`.
- **Даты:** поля-календари работают в формате `DD.MM.YYYY`, при сохранении конвертируются в `YYYY-MM-DD`; при загрузке — обратно.
- **Валидация:** название и колонка обязательны, дата начала обязательна.

## Модели

| Модель                     | Файл                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| `TaskGroupModel`           | `src/app/models/task-group.model.ts`                                  |
| `TaskModel`                | `src/app/models/task.model.ts`                                        |
| `TaskIndexParams`          | `src/app/models/params/task-index.params.ts`                          |
| `TaskGroupIndexParams`     | `src/app/models/params/task-group-index.params.ts`                    |
| `TaskGroupsIndexResponse`  | `src/app/models/responses/task-groups/task-groups-index.response.ts`  |
| `TaskGroupsShowResponse`   | `src/app/models/responses/task-groups/task-groups-show.response.ts`   |
| `TaskGroupsCreateResponse` | `src/app/models/responses/task-groups/task-groups-create.response.ts` |
| `TaskGroupsUpdateResponse` | `src/app/models/responses/task-groups/task-groups-update.response.ts` |
| `TasksIndexResponse`       | `src/app/models/responses/tasks/tasks-index.response.ts`              |
| `TasksShowResponse`        | `src/app/models/responses/tasks/tasks-show.response.ts`               |
| `TasksCreateResponse`      | `src/app/models/responses/tasks/tasks-create.response.ts`             |
| `TasksUpdateResponse`      | `src/app/models/responses/tasks/tasks-update.response.ts`             |

```ts
interface TaskGroupModel {
    id: number;
    title: string;
    position: number;
    tasks_count?: number;
    created_at: string;
    updated_at: string;
}

interface TaskModel {
    id: number;
    group_id: number;
    group?: TaskGroupModel;
    title: string;
    description: string | null;
    parent_id: number | null;
    created_by: number | null;
    assigned_to: number | null;
    creator?: UserShort | null;
    assignee?: UserShort | null;
    start_at: string;
    finish_at: string | null;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
}
```

## Сервисы

`TaskGroupService` (`src/app/services/task-group.service.ts`), базовый путь `/task-groups/`.

| Метод    | HTTP   | Путь                |
| -------- | ------ | ------------------- |
| `index`  | GET    | `/task-groups/`     |
| `show`   | GET    | `/task-groups/{id}` |
| `create` | POST   | `/task-groups/`     |
| `update` | PUT    | `/task-groups/{id}` |
| `delete` | DELETE | `/task-groups/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`.

`TaskService` (`src/app/services/task.service.ts`), базовый путь `/tasks/`.

| Метод    | HTTP   | Путь          |
| -------- | ------ | ------------- |
| `index`  | GET    | `/tasks/`     |
| `show`   | GET    | `/tasks/{id}` |
| `create` | POST   | `/tasks/`     |
| `update` | PUT    | `/tasks/{id}` |
| `delete` | DELETE | `/tasks/{id}` |

- **Query (index):** `page`, `per_page`, `query`, `sort`, `direction`, `group_id`, `assigned_to`, `root_only`.

## Зависимости

- `SkeletonComponent`, `IconComponent`, `InputFieldComponent`, `TextareaFieldComponent`, `SelectFieldComponent`, `AutocompleteFieldComponent`, `CalendarFieldComponent`.
- `PopupService`, `ConfirmService`, `NotificationService`.

## Известные ограничения

- Перетаскивание колонок и задач (drag & drop) не реализовано.
- Порядок колонок задаётся полем `position` через попап, отдельного drag-сортировщика нет.
- Дерево подзадач (`parent_id`) в интерфейсе не отображается.
