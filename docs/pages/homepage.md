# Страница «Главная» (homepage)

## Назначение

Приветственная страница админки: обращение к авторизованному пользователю,
текущая дата и карточки-ссылки на разделы, доступные пользователю.

## Расположение

```
src/app/pages/homepage/
├── homepage.ts
├── homepage.html
└── homepage.scss
```

## Маршрут

| Путь | Компонент           |
| ---- | ------------------- |
| `/`  | `HomepageComponent` |

Определён в `src/app/app.routes.ts`.

## Компонент `HomepageComponent`

Селектор `app-homepage`, standalone, `OnPush`.

**Состояние (signals/computed):**

- `userName` — имя текущего пользователя из `AuthService.user()`;
- `greeting` — приветствие по времени суток («Доброе утро», «Добрый день»,
  «Добрый вечер», «Доброй ночи»);
- `welcomeTitle` — «Добро пожаловать, {имя}!» либо «Добро пожаловать!»;
- `today` — текущая дата в формате `ru-RU` с днём недели;
- `loading` — идёт загрузка разделов;
- `sections` — доступные пользователю модули верхнего уровня (`ModuleModel[]`).

**Методы:**

- `ngOnInit()` → `loadSections()`;
- `loadSections()` — `ModuleService.available()`, при ошибке список пустой;
- `resolveGreeting(hour)` — текст приветствия по часу суток.

## Шаблон и стили

- Блок `.welcome` — градиент от `$primary-light-color` к белому, приветствие,
  заголовок, дата и поясняющий текст.
- Блок `.sections` — заголовок «Доступные разделы» и сетка карточек
  (`repeat(auto-fill, minmax(280px, 1fr))`).
- Карточка: иконка модуля, название, путь, стрелка; hover — рамка и фон иконки
  в `$primary-color`, подъём на 2px.
- Скелетоны при загрузке (`app-skeleton`), пустое состояние при отсутствии прав.

## Зависимости

- `AuthService` — имя пользователя.
- `ModuleService.available()` — `GET /api/modules/available`.
- `IconComponent`, `SkeletonComponent`, `RouterLink`.

## Известные ограничения

- Список разделов не обновляется автоматически при изменении прав.
- `ModuleService.available()` вызывается также в `NavigationComponent` и
  `SectionPageComponent` — кэша между ними нет.
