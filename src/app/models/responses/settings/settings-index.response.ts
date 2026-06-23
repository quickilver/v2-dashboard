import { MetaModel } from '../../meta.model';
import { SettingModel } from '../../setting.model';

export interface SettingsIndexResponse {
    data: SettingModel[];
    meta: MetaModel;
}
