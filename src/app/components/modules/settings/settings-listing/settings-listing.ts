import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnInit,
    computed,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { SettingFieldComponent } from '../../../fields/setting-field/setting-field';
import { SettingService } from '../../../../services/setting.service';
import { SettingGroupService } from '../../../../services/setting-group.service';
import { SettingModel } from '../../../../models/setting.model';
import { SettingGroupModel } from '../../../../models/setting-group.model';
import { NotificationService } from '../../../../services/notification.service';

interface SettingsGroup {
    key: string;
    title: string;
    settings: SettingModel[];
}

@Component({
    selector: 'app-settings-listing',
    standalone: true,
    imports: [SettingFieldComponent],
    templateUrl: './settings-listing.html',
    styleUrl: './settings-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(window:scroll)': 'onGroupsScroll()',
    },
})
export class SettingsListingComponent implements OnInit {
    private readonly settingService = inject(SettingService);
    private readonly settingGroupService = inject(SettingGroupService);
    private readonly notificationService = inject(NotificationService);

    readonly allSettings = input<SettingModel[]>([]);

    private readonly groupsContainer = viewChild<ElementRef<HTMLElement>>('groupsContainer');

    settings = signal<SettingModel[]>([]);
    groups = signal<SettingGroupModel[]>([]);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    activeGroupIndex = signal<number>(0);
    draftValues = signal<Record<number, string | null>>({});

    groupedSettings = computed<SettingsGroup[]>(() => {
        const settings = this.settings();
        const groups = this.groups();

        const result: SettingsGroup[] = groups.map((group) => ({
            key: String(group.id),
            title: group.title,
            settings: settings.filter((setting) => setting.group_id === group.id),
        }));

        const ungrouped = settings.filter((setting) => setting.group_id === null);

        if (ungrouped.length > 0) {
            result.push({
                key: 'none',
                title: 'Без группы',
                settings: ungrouped,
            });
        }

        return result;
    });

    ngOnInit(): void {
        this.loadSettings();
    }

    async loadSettings(): Promise<void> {
        this.loading.set(true);

        try {
            const [settingsResponse, groupsResponse] = await Promise.all([
                this.settingService.index({ per_page: 100 }),
                this.settingGroupService.index(),
            ]);

            this.settings.set(settingsResponse.data);
            this.groups.set(groupsResponse.data);
            this.draftValues.set({});
        } catch (error) {
            this.notificationService.error('Ошибка при загрузке настроек');
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Сохраняет изменённые значения настроек.
     */
    async onSave(): Promise<void> {
        const drafts = this.draftValues();
        const changedSettings = this.settings().filter(
            (setting) => drafts[setting.id] !== undefined,
        );

        if (changedSettings.length === 0) {
            this.notificationService.info('Нет изменений для сохранения');

            return;
        }

        this.saving.set(true);

        try {
            await Promise.all(
                changedSettings.map((setting) =>
                    this.settingService.update(setting.id, {
                        title: setting.title,
                        alias: setting.alias,
                        type: setting.type,
                        group_id: setting.group_id,
                        options: setting.options,
                        value: drafts[setting.id],
                    }),
                ),
            );

            this.settings.update((settings) =>
                settings.map((setting) =>
                    drafts[setting.id] !== undefined
                        ? { ...setting, value: drafts[setting.id] }
                        : setting,
                ),
            );
            this.draftValues.set({});
            this.notificationService.success('Настройки сохранены');
        } catch {
            this.notificationService.error('Ошибка при сохранении настроек');
        } finally {
            this.saving.set(false);
        }
    }

    /**
     * Запоминает изменённое значение настройки до сохранения.
     */
    onValueChange(setting: SettingModel, value: string | number | boolean): void {
        const normalizedValue = this.normalizeValue(setting, value);
        const originalValue = this.getOriginalValue(setting);

        this.draftValues.update((values) => {
            const nextValues: Record<number, string | null> = { ...values };

            if (normalizedValue === originalValue) {
                delete nextValues[setting.id];
            } else {
                nextValues[setting.id] = normalizedValue;
            }

            return nextValues;
        });
    }

    /**
     * Приводит значение поля к строке для сохранения в API.
     */
    private normalizeValue(setting: SettingModel, value: string | number | boolean): string | null {
        if (setting.type === 'checkbox') {
            return value ? '1' : '0';
        }

        const stringValue = String(value ?? '');

        return stringValue === '' ? null : stringValue;
    }

    /**
     * Возвращает исходное значение настройки в том же формате, что и `normalizeValue`.
     */
    private getOriginalValue(setting: SettingModel): string | null {
        if (setting.type === 'checkbox') {
            return setting.value === '1' || setting.value === 'true' ? '1' : '0';
        }

        return this.normalizeValue(setting, this.getFieldValue(setting));
    }

    /**
     * Определяет тип поля для компонента настройки.
     */
    getFieldType(setting: SettingModel): 'text' | 'checkbox' | 'select' {
        if (setting.type === 'checkbox') return 'checkbox';
        if (setting.type === 'select') return 'select';

        return 'text';
    }

    /**
     * Приводит значение настройки к типу поля.
     */
    getFieldValue(setting: SettingModel): string | number | boolean {
        if (setting.type === 'checkbox') {
            return setting.value === '1' || setting.value === 'true';
        }

        if (setting.type === 'select') {
            const numericValue = Number(setting.value);

            return setting.value !== null && setting.value !== '' && !Number.isNaN(numericValue)
                ? numericValue
                : (setting.value ?? '');
        }

        return setting.value ?? '';
    }

    /**
     * Прокручивает страницу к выбранной группе.
     */
    scrollToGroup(index: number): void {
        this.activeGroupIndex.set(index);

        const container = this.groupsContainer()?.nativeElement;
        const target = container?.querySelector<HTMLElement>(`[data-group-index="${index}"]`);

        if (!target) return;

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Подсвечивает группу, к которой прокручена страница.
     */
    onGroupsScroll(): void {
        const container = this.groupsContainer()?.nativeElement;

        if (!container) return;

        const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-group-index]'));

        const viewportTop = 20;
        let currentIndex = 0;

        for (const section of sections) {
            if (section.getBoundingClientRect().top <= viewportTop) {
                currentIndex = Number(section.dataset['groupIndex']);
            }
        }

        this.activeGroupIndex.set(currentIndex);
    }
}
