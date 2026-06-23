import {
    Component,
    computed,
    input,
    output,
    signal,
    ChangeDetectionStrategy,
} from '@angular/core';
import { SettingModel } from '../../../../models/setting.model';

@Component({
    selector: 'app-settings-groups',
    standalone: true,
    imports: [],
    templateUrl: './settings-groups.html',
    styleUrl: './settings-groups.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsGroupsComponent {
    readonly settings = input<SettingModel[]>([]);

    readonly selectedGroup = signal<string | null>(null);

    readonly groupSelected = output<string | null>();

    readonly groups = computed(() => {
        const groupsSet = new Set<string>();
        for (const setting of this.settings()) {
            if (setting.group) {
                groupsSet.add(setting.group);
            }
        }
        return Array.from(groupsSet).sort();
    });

    selectGroup(group: string | null): void {
        this.selectedGroup.set(group);
        this.groupSelected.emit(group);
    }
}
