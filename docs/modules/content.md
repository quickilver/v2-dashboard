# Модуль «Контент» (лендинг раздела)

## Назначение

Стартовая страница раздела «Контент»: карточки-ссылки на подразделы
(«Страницы» и др.), доступные авторизованному пользователю.

## Расположение

```
src/app/pages/content/
├── content.ts      # ContentPageComponent — тонкая обёртка над SectionPageComponent
└── content.html    # шаблон с <app-section-page />
```

Общая вёрстка и логика — в `src/app/components/section-page/`
(см. [section-page.md](../components/section-page.md)).

## Маршрут

| Путь       | Компонент              |
| ---------- | ---------------------- |
| `/content` | `ContentPageComponent` |

Путь совпадает с `path` модуля в `ModuleSeeder` (`/content/`) — это обязательно,
иначе `SectionPageComponent` не найдёт дочерние модули.

## Компонент `ContentPageComponent`

Селектор `app-content-page`, standalone, `OnPush`. Рендерит
`<app-section-page title="Контент" sectionPath="/content/" ... />`.

## Связанные маршруты

| Путь             | Компонент               |
| ---------------- | ----------------------- |
| `/content/pages` | `PagesListingComponent` |

## Известные ограничения

- Список подразделов не обновляется автоматически при изменении прав.
