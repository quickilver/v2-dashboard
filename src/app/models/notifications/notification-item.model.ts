import type { WritableSignal } from '@angular/core';
import type { NotificationType } from './notification-type.model';

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    description?: string;
    progress: WritableSignal<number>;
    dismiss: () => void;
}
