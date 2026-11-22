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
import { AuthService } from '../../../../services/auth.service';
import { BackupService } from '../../../../services/backup.service';
import { BackupModel } from '../../../../models/backup.model';
import { BackupsIndexResponse } from '../../../../models/responses/backups/backups-index.response';
import { NotificationService } from '../../../../services/notification.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { BackupRow } from './backup-row.model';
import { MetaModel } from '../../../../models/meta.model';

@Component({
    selector: 'app-backup-listing',
    standalone: true,
    imports: [ListingComponent],
    templateUrl: './backup-listing.html',
    styleUrl: './backup-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackupListingComponent implements OnInit {
    private readonly authService = inject(AuthService);
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
    canUpload = computed<boolean>(() => this.authService.user()?.full_access === true);
    backupActionPending = computed<boolean>(
        () => this.creating() || this.restoring() !== null || this.confirmService.isShow(),
    );
    pageSize = signal<number>(50);
    page = signal<number>(1);

    rows = computed<BackupRow[]>(() => this.backups().map((backup) => this.toRow(backup)));

    pagedRows = computed<BackupRow[]>(() => {
        const start = (this.page() - 1) * this.pageSize();

        return this.rows().slice(start, start + this.pageSize());
    });

    meta = computed<MetaModel | null>(() => {
        const total = this.rows().length;
        const perPage = this.pageSize();
        const lastPage = Math.max(1, Math.ceil(total / perPage));

        return {
            current_page: this.page(),
            from: total === 0 ? 0 : (this.page() - 1) * perPage + 1,
            last_page: lastPage,
            per_page: perPage,
            to: Math.min(total, this.page() * perPage),
            total,
            links: [],
        };
    });

    ngOnInit(): void {
        this.loadBackups();
    }

    async loadBackups(): Promise<void> {
        this.loading.set(true);
        try {
            const response: BackupsIndexResponse = await this.backupService.index();
            this.backups.set(response.data);

            const lastPage = Math.max(1, Math.ceil(response.data.length / this.pageSize()));

            if (this.page() > lastPage) {
                this.page.set(lastPage);
            }
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке бэкапов');
        } finally {
            this.loading.set(false);
        }
    }

    async onCreateBackup(): Promise<void> {
        if (this.backupActionPending()) return;

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

    onPageChange(page: number): void {
        this.page.set(page);
    }

    onPageSizeChange(pageSize: number): void {
        this.pageSize.set(pageSize);
        this.page.set(1);
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

    async onUpload(input: HTMLInputElement): Promise<void> {
        const file: File | undefined = input.files?.[0];
        input.value = '';

        if (!file || !this.canUpload()) return;

        if (!/\.sql(?:\.gz)?$/i.test(file.name) || file.size === 0) {
            this.notificationService.error('Выберите непустой дамп в формате .sql или .sql.gz');
            return;
        }

        await this.restoreBackup(file.name, file);
    }

    async onRestore(row: BackupRow): Promise<void> {
        await this.restoreBackup(row.fileName);
    }

    private async restoreBackup(fileName: string, upload?: File): Promise<void> {
        if (this.backupActionPending()) return;

        const actionLabel: string = upload ? 'Загрузить и восстановить' : 'Восстановить';
        const description: string = upload
            ? `Загрузить файл "${fileName}" и восстановить из него базу? Текущие данные будут заменены.`
            : `Восстановить базу из файла "${fileName}"? Текущие данные будут заменены.`;
        const confirmed: boolean = await this.confirmService.confirm(
            'Восстановление базы данных',
            description,
            actionLabel,
            'Отмена',
        );

        if (!confirmed) return;

        this.restoring.set(fileName);
        try {
            if (upload) {
                await this.backupService.uploadAndRestore(upload, true);
            } else {
                await this.backupService.restore(fileName, false, true);
            }

            this.notificationService.success('База данных успешно восстановлена');
        } catch (error) {
            this.notificationService.error('Ошибка при восстановлении базы данных');
        } finally {
            if (upload) {
                this.page.set(1);
                await this.loadBackups();
            }
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
        const match = fileName.match(/^(?:dump|upload)_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})/);
        if (!match) return '';

        const [, date, time] = match;
        return new Date(`${date}T${time.replace(/-/g, ':')}`).toLocaleString('ru-RU');
    }
}
