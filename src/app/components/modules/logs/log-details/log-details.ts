import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    signal,
    OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogService } from '../../../../services/log.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LogModel } from '../../../../models/log.model';
import { LogEventLabel, formatModelType, formatJson } from './log-helpers';

@Component({
    selector: 'app-log-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './log-details.html',
    styleUrl: './log-details.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogDetailsComponent implements OnInit {
    private readonly logService = inject(LogService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    loading = signal<boolean>(false);
    log = signal<LogModel | null>(null);

    protected readonly logEventLabel = LogEventLabel;
    protected readonly formatModelType = formatModelType;
    protected readonly formatJson = formatJson;

    ngOnInit(): void {
        const logId = this.id();
        if (logId) {
            this.loadLog(logId);
        }
    }

    private async loadLog(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.logService.show(id);
            this.log.set(response.data);
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные лога');
        } finally {
            this.loading.set(false);
        }
    }

    onClose(): void {
        this.popupService.resolve();
    }
}