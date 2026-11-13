# Компонент `TabsFieldComponent`

## Назначение

Табы в стиле iOS (segmented control): серый контейнер со скользящим белым
«бегунком» под активным табом. Работает как поле формы через `model()`.

## Расположение

```
src/app/components/fields/tabs-field/
├── tabs-field.ts
├── tabs-field.html
└── tabs-field.scss
```

## Селектор и входы

Селектор `app-tabs-field`, standalone, `OnPush`.

| Вход        | Тип                 | По умолчанию | Назначение                         |
| ----------- | ------------------- | ------------ | ---------------------------------- |
| `label`     | `string`            | `''`         | Подпись над табами                 |
| `options`   | `TabsFieldOption[]` | `[]`         | Список табов                       |
| `fullWidth` | `boolean`           | `true`       | Растянуть на всю ширину контейнера |
| `small`     | `boolean`           | `false`      | Компактный размер                  |
| `value`     | `model`             | `null`       | Активное значение (`[(value)]`)    |

```ts
interface TabsFieldOption {
    label: string;
    value: string | number;
    icon?: string;
    disabled?: boolean;
}
```

## Логика

- `activeIndex` — индекс активного таба по `value()`;
- `thumbStyle` — `width` и `transform` белого «бегунка»; при отсутствии
  активного таба скрывается (`display: none`);
- `select(option)` — устанавливает `value`, игнорируя `disabled`.

## Стили

- Контейнер: `background: $grey-light`, `border-radius: 10px`, `padding: 4px`.
- «Бегунок»: белый, `border-radius: 7px`, тень, переход
  `transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)`.
- Активный таб — `font-weight: 600`; неактивный при hover — `$primary-color`.
- `small` — высота таба 28px, шрифт 12px.

## Использование

```html
<app-tabs-field [options]="tabs" [(value)]="activeTab" />
```

## Известные ограничения

- Горизонтальный скролл при большом числе табов не предусмотрен — используйте
  `small` или сокращайте подписи.
