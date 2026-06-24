import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    model,
    signal,
    OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CheckboxFieldComponent } from '../../../fields/checkbox-field/checkbox-field';
import { UserService } from '../../../../services/user.service';
import { ModuleService } from '../../../../services/module.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { UserModel } from '../../../../models/user.model';
import { ModuleModel } from '../../../../models/module.model';

@Component({
    selector: 'app-users-editor',
    standalone: true,
    imports: [FormsModule, InputFieldComponent, CheckboxFieldComponent],
    templateUrl: './users-editor.html',
    styleUrl: './users-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersEditorComponent implements OnInit {
    private readonly userService = inject(UserService);
    private readonly moduleService = inject(ModuleService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    name = model<string>('');
    email = model<string>('');
    fullAccess = model<boolean>(false);

    modules = signal<ModuleModel[]>([]);
    permissions = signal<number[]>([]);

    flatModules = computed(() => {
        const result: { module: ModuleModel; children: ModuleModel[] }[] = [];
        for (const parent of this.modules()) {
            result.push({
                module: parent,
                children: parent.children ?? [],
            });
        }
        return result;
    });

    ngOnInit(): void {
        this.loadModules();
        const userId = this.id();
        if (userId) {
            this.isEditMode.set(true);
            this.loadUser(userId);
        }
    }

    private async loadModules(): Promise<void> {
        try {
            const response = await this.moduleService.index();
            this.modules.set(response.data);
        } catch {
            this.notificationService.error('Не удалось загрузить модули');
        }
    }

    private async loadUser(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.userService.show(id);
            const user = response.data;
            this.name.set(user.name);
            this.email.set(user.email);
            this.fullAccess.set(user.full_access);
        } catch {
            this.notificationService.error('Не удалось загрузить данные пользователя');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<UserModel> & { permissions?: number[] } = {
                name: this.name().trim(),
                email: this.email().trim(),
                full_access: this.fullAccess(),
                permissions: this.permissions(),
            };

            if (this.isEditMode()) {
                await this.userService.update(this.id()!, data);
            } else {
                await this.userService.create(data);
            }

            this.notificationService.success('Пользователь успешно сохранён');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(response.error?.message || 'Ошибка сохранения');
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }

    toggleModule(moduleId: number): void {
        this.permissions.update((list) => {
            if (list.includes(moduleId)) {
                return list.filter((id) => id !== moduleId);
            }
            return [...list, moduleId];
        });
    }

    isActiveTab(tab: string): boolean {
        return this.tab() === tab;
    }

    changeTab(tab: string): void {
        this.tab.set(tab);
    }
}
