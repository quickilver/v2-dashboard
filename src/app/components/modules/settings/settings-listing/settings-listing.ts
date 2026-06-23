import { Component, signal, input, effect, untracked, ChangeDetectionStrategy, inject } from '@angular/core';
import { ListingComponent } from '../../../listing/listing';
import { ListingColumn } from '../../../../models/listing.model';
import { SettingService } from '../../../../services/setting.service';
import { SettingModel } from '../../../../models/setting.model';
import { SettingsIndexResponse } from '../../../../models/responses/settings/settings-index.response';
import { MetaModel } from '../../../../models/meta.model';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { SettingsEditorComponent } from '../settings-editor/settings-editor';
import { SettingsGroupsComponent } from '../settings-groups/settings-groups';
import { SettingIndexParams } from '../../../../models/params/setting-index.params';

@Component({
    selector: 'app-settings-listing',
    standalone: true,
    imports: [ListingComponent, SettingsGroupsComponent],
    templateUrl: './settings-listing.html',
    styleUrl: './settings-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsListingComponent {
    private readonly settingService = inject(SettingService);
    private readonly confirmService = inject(ConfirmService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    readonly allSettings = input<SettingModel[]>([]);

    readonly selectedGroup = signal<string | null>(null);

    columns = signal<ListingColumn[]>([
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'title', title: 'Название', sortable: true },
        { key: 'alias', title: 'Алиас', sortable: true },
        { key: 'type', title: 'Тип', sortable: true, width: '100px' },
        { key: 'group', title: 'Группа', sortable: true },
        { key: 'value', title: 'Значение', sortable: true },
    ]);

    settings = signal<SettingModel[]>([]);
    loading = signal<boolean>(false);
    meta = signal<MetaModel | null>(null);
    pageSize = signal<number>(50);
    page = signal<number>(1);

    private currentSearch: string = '';
    private currentSort: string = '';
    private currentDirection: 'asc' | 'desc' = 'asc';

    constructor() {
        effect(() => {
            // Reload whenever the group filter changes (untracked to avoid loops)
            const g = this.selectedGroup();
            untracked(() => {
                this.page.set(1);
                this.loadSettings();
            });
        });
    }

    onGroupSelected(group: string | null): void {
        this.selectedGroup.set(group);
    }

    async loadSettings(): Promise<void> {
        this.loading.set(true);
        try {
            const params: SettingIndexParams = {
                page: this.page(),
                per_page: this.pageSize(),
                query: this.currentSearch,
                sort: this.currentSort,
                direction: this.currentDirection,
                group: this.selectedGroup() ?? undefined,
            };

            const response: SettingsIndexResponse = await this.settingService.index(params);
            this.settings.set(response.data);
            this.meta.set(response.meta);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке настроек');
        } finally {
            this.loading.set(false);
        }
    }

    onRowClick(setting: SettingModel): void {
        this.onEdit(setting);
    }

    onEdit(setting: SettingModel): void {
        this.popupService.open(
            'Редактирование настройки',
            SettingsEditorComponent,
            { id: setting.id }
        ).then(() => {
            this.loadSettings();
        });
    }

    async onDelete(setting: SettingModel): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Удаление настройки',
            `Вы уверены, что хотите удалить настройку "${setting.title}"?`,
            'Удалить',
            'Отмена'
        );

        if (confirmed) {
            try {
                await this.settingService.delete(setting.id);
                this.notificationService.success('Настройка успешно удалена');
                this.loadSettings();
            } catch (error) {
                this.notificationService.error('Ошибка при удалении настройки');
            }
        }
    }

    createClick(): void {
        this.popupService.open(
            'Создание настройки',
            SettingsEditorComponent
        ).then(() => {
            this.loadSettings();
        });
    }

    onSearch(query: string): void {
        this.currentSearch = query;
        this.page.set(1);
        this.loadSettings();
    }

    onSort(sort: { key: string; direction: 'asc' | 'desc' }): void {
        this.currentSort = sort.key;
        this.currentDirection = sort.direction;
        this.page.set(1);
        this.loadSettings();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadSettings();
    }
}
