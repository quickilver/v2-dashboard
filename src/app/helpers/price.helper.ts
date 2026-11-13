/**
 * Форматирование денежных сумм.
 */
export class PriceHelper {
    /**
     * Приводит число к строке с разделителями тысяч (неразрывный пробел).
     *
     * `1234567` → `1 234 567`
     */
    static format(value: number | string | null | undefined): string {
        const amount = PriceHelper.toNumber(value);

        if (amount === null) {
            return '';
        }

        const [integerPart, fractionPart] = Math.abs(amount).toFixed(2).split('.');
        const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
        const sign = amount < 0 ? '-' : '';
        const fraction = fractionPart === '00' ? '' : `,${fractionPart}`;

        return `${sign}${grouped}${fraction}`;
    }

    /**
     * Приводит число к строке с разделителями тысяч без копеек.
     *
     * `1234567` → `1 234 567`
     */
    static formatInteger(value: number | string | null | undefined): string {
        const amount = PriceHelper.toNumber(value);

        if (amount === null) {
            return '';
        }

        const rounded = Math.round(Math.abs(amount));
        const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

        return amount < 0 ? `-${grouped}` : grouped;
    }

    private static toNumber(value: number | string | null | undefined): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const amount = typeof value === 'number' ? value : Number(String(value).replace(/\s/g, ''));

        return Number.isFinite(amount) ? amount : null;
    }
}
