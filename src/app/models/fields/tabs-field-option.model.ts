export interface TabsFieldOption {
    label: string;
    value: string | number;
    /** Иконка из `assets/icons` (необязательно). */
    icon?: string;
    /** Отключить таб. */
    disabled?: boolean;
}
