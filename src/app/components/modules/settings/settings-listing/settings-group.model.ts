import type { SettingModel } from '../../../../models/setting.model';

export interface SettingsGroup {
    key: string;
    title: string;
    settings: SettingModel[];
}
