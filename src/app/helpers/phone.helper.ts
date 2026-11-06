import { MaskHelper } from './mask.helper';

export class PhoneHelper {
    static readonly MASK = '+7 (999) 999-99-99';

    /**
     * Оставляет только цифры.
     */
    static digitsOnly(value: string | number | null | undefined): string {
        return String(value ?? '').replace(/\D/g, '');
    }

    /**
     * Приводит телефон к формату 9998885566 (10 цифр без +7/8).
     */
    static normalize(value: string | number | null | undefined): string {
        const digits = PhoneHelper.digitsOnly(value);

        if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
            return digits.slice(1);
        }

        return digits;
    }

    /**
     * Приводит телефон к числу для сохранения (9998885566) или null.
     */
    static toNumber(value: string | number | null | undefined): number | null {
        const normalized = PhoneHelper.normalize(value);

        return normalized ? Number(normalized) : null;
    }

    /**
     * Форматирует телефон в маску +7 (999) 999-99-99.
     */
    static format(value: string | number | null | undefined): string {
        const normalized = PhoneHelper.normalize(value);

        if (!normalized) {
            return '';
        }

        return MaskHelper.apply(normalized, PhoneHelper.MASK);
    }
}
