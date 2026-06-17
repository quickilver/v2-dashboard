import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-notification',
    imports: [],
    templateUrl: './notification.html',
    styleUrl: './notification.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
    protected readonly notificationService: NotificationService = inject(NotificationService);
}