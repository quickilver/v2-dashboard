# Модуль «Закупка» (лендинг раздела)

## Назначение

Стартовая страница раздела «Закупка»: карточки-ссылки на подразделы
(«Контрагенты», «Поступления» и др.), доступные авторизованному пользователю.

## Расположение

```
src/app/pages/purchasing/
├── purchasing.ts   # PurchasingPageComponent — тонкая обёртка над SectionPageComponent
└── purchasing.html # шаблон с <app-section-page />
```

Общая вёрстка и логика — в `src/app/components/section-page/`
(см. [section-page.md](../components/section-page.md)).

## Маршрут

| Путь                     | Компонент                 |
| ------------------------ | ------------------------- |
| `/purchasing_department` | `PurchasingPageComponent` |

Путь совпадает с `path` модуля в `ModuleSeeder` (`/purchasing_department/`) —
это обязательно, иначе `SectionPageComponent` не найдёт дочерние модули.

## Компонент `PurchasingPageComponent`

Селектор `app-purchasing-page`, standalone, `OnPush`. Рендерит
`<app-section-page title="Закупка" sectionPath="/purchasing_department/" ... />`.

## Связанные маршруты

| Путь         | Компонент                   |
| ------------ | --------------------------- |
| `/suppliers` | `SuppliersListingComponent` |
| `/receives`  | `ReceivesListingComponent`  |

## Известные ограничения

- Список подразделов не обновляется автоматически при изменении прав.
