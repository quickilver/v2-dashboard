import { Component, signal, input, computed, effect, untracked, ChangeDetectionStrategy, inject } from '@angular/core';
import { SettingFieldComponent } from '../../../fields/setting-field/setting-field';
import { SettingService } from '../../../../services/setting.service';
import { SettingModel } from '../../../../models/setting.model';
import { SettingsIndexResponse } from '../../../../models/responses/settings/settings-index.response';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-settings-listing',
    standalone: true,
    imports: [SettingFieldComponent],
    templateUrl: './settings-listing.html',
    styleUrl: './settings-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsListingComponent {
    private readonly settingService = inject(SettingService);
    private readonly notificationService = inject(NotificationService);

    readonly allSettings = input<SettingModel[]>([]);

    settings = signal<SettingModel[]>([]);
    loading = signal<boolean>(false);

    /** Settings grouped by `group` property, preserving order */
    groupedSettings = computed(() => {
        const groups = new Map<string, SettingModel[]>();
        for (const setting of this.settings()) {
            const key = setting.group ?? '';
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(setting);
        }
        return Array.from(groups.entries());
    });

    ngOnInit(): void {
        this.loadSettings();
    }

    async loadSettings(): Promise<void> {
        this.loading.set(true);
        try {
            const response: SettingsIndexResponse = await this.settingService.index();
            this.settings.set(response.data);
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке настроек');
        } finally {
            this.loading.set(false);
        }
    }
}
