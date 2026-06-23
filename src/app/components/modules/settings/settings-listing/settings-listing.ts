import { Component, signal, input, effect, untracked, ChangeDetectionStrategy, inject } from '@angular/core';
import { SettingFieldComponent } from '../../../fields/setting-field/setting-field';
import { SettingService } from '../../../../services/setting.service';
import { SettingModel } from '../../../../models/setting.model';
import { SettingsIndexResponse } from '../../../../models/responses/settings/settings-index.response';
import { ConfirmService } from '../../../../services/confirm.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { SettingsEditorComponent } from '../settings-editor/settings-editor';
import { SettingsGroupsComponent } from '../settings-groups/settings-groups';

@Component({
    selector: 'app-settings-listing',
    standalone: true,
    imports: [SettingFieldComponent, SettingsGroupsComponent],
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

    settings = signal<SettingModel[]>([]);
    loading = signal<boolean>(false);

    constructor() {
        effect(() => {
            const g = this.selectedGroup();
            untracked(() => this.loadSettings());
        });
    }

    onGroupSelected(group: string | null): void {
        this.selectedGroup.set(group);
    }

    async loadSettings(): Promise<void> {
        this.loading.set(true);
        try {
            const response: SettingsIndexResponse = await this.settingService.index({
                group: this.selectedGroup() ?? undefined,
            });
            this.settings.set(response.data);
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
}
