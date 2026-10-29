import { LogEvent } from '../../../../models/log.model';

export const LogEventLabel: Record<LogEvent, string> = {
    created: 'Создание',
    updated: 'Обновление',
    deleted: 'Удаление',
    restored: 'Восстановление',
};

export function formatModelType(modelType: string): string {
    const parts = modelType.split('\\');
    return parts[parts.length - 1];
}

export function formatJson(value: unknown): string {
    if (value === null || value === undefined) return '—';
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}