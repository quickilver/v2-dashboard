/**
 * Работа с масками ввода.
 *
 * Символы-заполнители:
 * - `9` — цифра;
 * - `a` — буква;
 * - `*` — любой символ.
 */
export class MaskHelper {
    static readonly DIGIT = '9';
    static readonly LETTER = 'a';
    static readonly ANY = '*';

    static isPlaceholder(char: string): boolean {
        return char === MaskHelper.DIGIT || char === MaskHelper.LETTER || char === MaskHelper.ANY;
    }

    /**
     * Извлекает «значимые» символы из уже отформатированного значения,
     * отбрасывая литералы маски.
     */
    static extractValue(maskedValue: string, mask: string): string {
        let result = '';
        let valueIndex = 0;

        for (
            let maskIndex = 0;
            maskIndex < mask.length && valueIndex < maskedValue.length;
            maskIndex++
        ) {
            const maskChar = mask[maskIndex];

            if (MaskHelper.isPlaceholder(maskChar)) {
                result += maskedValue[valueIndex];
                valueIndex++;
                continue;
            }

            if (maskedValue[valueIndex] === maskChar) {
                valueIndex++;
            }
        }

        return result;
    }

    /**
     * Применяет маску к «сырому» значению.
     */
    static apply(rawValue: string, mask: string): string {
        const chars = rawValue.split('');
        let result = '';
        let charIndex = 0;

        for (const maskChar of mask) {
            if (charIndex >= chars.length) {
                break;
            }

            if (!MaskHelper.isPlaceholder(maskChar)) {
                result += maskChar;
                continue;
            }

            while (charIndex < chars.length) {
                const char = chars[charIndex];
                charIndex++;

                if (MaskHelper.matches(maskChar, char)) {
                    result += char;
                    break;
                }
            }
        }

        return result;
    }

    /**
     * Вычисляет позицию курсора по количеству введённых значимых символов.
     */
    static caretPosition(maskedValue: string, mask: string, valueIndex: number): number {
        if (valueIndex <= 0) {
            return 0;
        }

        let filled = 0;

        for (
            let maskIndex = 0;
            maskIndex < mask.length && maskIndex < maskedValue.length;
            maskIndex++
        ) {
            if (!MaskHelper.isPlaceholder(mask[maskIndex])) {
                continue;
            }

            filled++;

            if (filled === valueIndex) {
                return maskIndex + 1;
            }
        }

        return maskedValue.length;
    }

    private static matches(placeholder: string, char: string): boolean {
        switch (placeholder) {
            case MaskHelper.DIGIT:
                return /\d/.test(char);
            case MaskHelper.LETTER:
                return /[a-zA-Zа-яА-ЯёЁ]/.test(char);
            case MaskHelper.ANY:
                return true;
            default:
                return false;
        }
    }
}
