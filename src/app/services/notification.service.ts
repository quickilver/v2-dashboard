import { Injectable, signal, WritableSignal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    description?: string;
    progress: WritableSignal<number>;
    dismiss: () => void;
}

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    readonly notifications: WritableSignal<NotificationItem[]> = signal<NotificationItem[]>([]);

    add(type: NotificationType, title: string, description?: string): void {
        const id = this._generateId();
        const progress = signal<number>(100);

        const dismiss = () => {
            this.notifications.update((list) => list.filter((n) => n.id !== id));
        };

        const item: NotificationItem = { id, type, title, description, progress, dismiss };

        this.notifications.update((list) => [...list, item]);

        this._startTimer(item);
    }

    error(title: string, description?: string): void {
        this.add('error', title, description);
    }

    warning(title: string, description?: string): void {
        this.add('warning', title, description);
    }

    success(title: string, description?: string): void {
        this.add('success', title, description);
    }

    info(title: string, description?: string): void {
        this.add('info', title, description);
    }

    private _startTimer(item: NotificationItem): void {
        const duration = 10_000;
        const interval = 50;
        const step = (interval / duration) * 100;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += interval;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            item.progress.set(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
                item.dismiss();
            }
        }, interval);
    }

    private _generateId(): string {
        return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}
