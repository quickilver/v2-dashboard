import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    OnInit
} from '@angular/core';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { SettingService } from '../../../../services/setting.service';
import { PopupService } from '../../../../services/popup.service';
import { SettingModel } from '../../../../models/setting.model';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-settings-editor',
    standalone: true,
    imports: [InputFieldComponent],
    templateUrl: './settings-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsEditorComponent implements OnInit {
    private readonly settingService = inject(SettingService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);

    title = model<string>('');
    alias = model<string>('');
    type = model<string>('text');
    group = model<string>('');
    value = model<string>('');

    ngOnInit(): void {
        const settingId = this.id();
        if (settingId) {
            this.isEditMode.set(true);
            this.loadSetting(settingId);
        }
    }

    private async loadSetting(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.settingService.show(id);
            const setting = response.data;
            this.title.set(setting.title);
            this.alias.set(setting.alias);
            this.type.set(setting.type);
            this.group.set(setting.group ?? '');
            this.value.set(setting.value ?? '');
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные настройки');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<SettingModel> = {
                title: this.title().trim(),
                alias: this.alias().trim(),
                type: this.type().trim(),
                group: this.group().trim() || null,
                value: this.value().trim() || null,
            };

            if (this.isEditMode()) {
                await this.settingService.update(this.id()!, data);
            } else {
                await this.settingService.create(data);
            }

            this.notificationService.success('Настройка успешно сохранена');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(response.error?.message || 'Ошибка при сохранении настройки');
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }
}
