import {
    Component,
    signal,
    computed,
    ChangeDetectionStrategy,
    OnInit,
    inject,
} from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { BackupService } from '../../../../services/backup.service';
import { BackupModel } from '../../../../models/backup.model';
import { BackupsIndexResponse } from '../../../../models/responses/backups/backups-index.response';
import { NotificationService } from '../../../../services/notification.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { BackupRow } from './backup-row.model';

@Component({
    selector: 'app-backup-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './backup-listing.html',
    styleUrl: './backup-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackupListingComponent implements OnInit {
    private readonly backupService = inject(BackupService);
    private readonly notificationService = inject(NotificationService);
    private readonly confirmService = inject(ConfirmService);

    columns = signal<ListingColumn[]>([
        { key: 'name', title: 'Имя файла', sortable: true, type: 'link', isDefault: true },
        { key: 'size', title: 'Размер', sortable: false, width: '120px', isDefault: true },
        { key: 'extension', title: 'Формат', sortable: false, width: '100px', isDefault: true },
        {
            key: 'created_at',
            title: 'Дата создания',
            sortable: false,
            width: '180px',
            isDefault: true,
        },
    ]);

    columnsStorageKey = 'backups';

    backups = signal<BackupModel[]>([]);
    loading = signal<boolean>(false);
    creating = signal<boolean>(false);
    restoring = signal<string | null>(null);

    rows = computed<BackupRow[]>(() => this.backups().map((backup) => this.toRow(backup)));

    ngOnInit(): void {
        this.loadBackups();
    }

    async loadBackups(): Promise<void> {
        this.loading.set(true);
        try {
            const response: BackupsIndexResponse = await this.backupService.index();
            this.backups.set(response.data);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке бэкапов');
        } finally {
            this.loading.set(false);
        }
    }

    async onCreateBackup(): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Создание бэкапа',
            'Создать новый дамп базы данных? Это может занять некоторое время.',
            'Создать',
            'Отмена',
        );

        if (!confirmed) return;

        this.creating.set(true);
        try {
            await this.backupService.create(true, true);
            this.notificationService.success('Бэкап успешно создан');
            await this.loadBackups();
        } catch (error) {
            this.notificationService.error('Ошибка при создании бэкапа');
        } finally {
            this.creating.set(false);
        }
    }

    onRowClick(row: BackupRow): void {
        this.onRestore(row);
    }

    onCellClick(event: { row: BackupRow; column: ListingColumn }): void {
        if (event.column.key === 'name') {
            this.onDownload(event.row);
        }
    }

    async onDownload(row: BackupRow): Promise<void> {
        try {
            const blob = await this.backupService.download(row.fileName);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = row.fileName;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            this.notificationService.error('Ошибка при скачивании бэкапа');
        }
    }

    async onRestore(row: BackupRow): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Восстановление базы данных',
            `Вы уверены, что хотите восстановить базу из файла "${row.fileName}"? Текущие данные будут заменены.`,
            'Восстановить',
            'Отмена',
        );

        if (!confirmed) return;

        this.restoring.set(row.fileName);
        try {
            await this.backupService.restore(row.fileName, false, true);
            this.notificationService.success('База данных успешно восстановлена');
        } catch (error) {
            this.notificationService.error('Ошибка при восстановлении базы данных');
        } finally {
            this.restoring.set(null);
        }
    }

    private toRow(backup: BackupModel): BackupRow {
        return {
            name: backup.name,
            size: backup.size_human,
            extension: backup.extension,
            created_at: this.extractDate(backup.name),
            fileName: backup.name,
        };
    }

    private extractDate(fileName: string): string {
        const match = fileName.match(/dump_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})/);
        if (!match) return '';

        const [, date, time] = match;
        return new Date(`${date}T${time.replace(/-/g, ':')}`).toLocaleString('ru-RU');
    }
}
