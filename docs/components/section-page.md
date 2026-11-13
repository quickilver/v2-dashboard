# Компонент `SectionPageComponent`

## Назначение

Переиспользуемый лендинг раздела админки: заголовок, подзаголовок и сетка
карточек-ссылок на подразделы, доступные текущему пользователю. Используется
страницами `/catalog`, `/purchasing_department`, `/content`.

## Расположение

```
src/app/components/section-page/
├── section-page.ts
├── section-page.html
└── section-page.scss
```

## Селектор и входы

Селектор `app-section-page`, standalone, `OnPush`.

| Вход          | Тип      | По умолчанию                       | Назначение                                          |
| ------------- | -------- | ---------------------------------- | --------------------------------------------------- |
| `title`       | `string` | `''`                               | Заголовок страницы                                  |
| `subtitle`    | `string` | `'Разделы, доступные вам'`         | Подзаголовок                                        |
| `sectionPath` | `string` | `''`                               | `path` модуля-контейнера, чьи `children` показывать |
| `emptyText`   | `string` | `'Обратитесь к администратору...'` | Текст пустого состояния                             |

## Состояние и логика

- `loading` — идёт загрузка;
- `sections` — список подразделов (`ModuleModel[]`);
- `ngOnInit()` → `loadSections()` → `ModuleService.available()`;
- `resolveSections(modules)` — берёт `children` модуля с `path === sectionPath()`;
  если `sectionPath` не задан, показывает все доступные листовые разделы
  (дети групп + группы без детей).

## Шаблон и стили

- Сетка `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`.
- Карточка: иконка модуля, название, путь, стрелка; hover — рамка и фон иконки
  в `$primary-color`, подъём на 2px.
- Скелетоны при загрузке (`app-skeleton`).
- Пустое состояние с иконкой папки и подсказкой.

## Зависимости

- `ModuleService.available()` — `GET /api/modules/available` (без проверки прав
  на модуль, дерево по правам пользователя).
- `IconComponent`, `SkeletonComponent`, `RouterLink`.

## Известные ограничения

- Каждый экземпляр делает собственный запрос `available()`; кэша между
  страницами и навигацией нет.
- Список не обновляется автоматически при изменении прав.
