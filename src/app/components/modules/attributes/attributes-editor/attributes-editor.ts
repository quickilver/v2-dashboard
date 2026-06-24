import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    model,
    signal,
    OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../../fields/input-field/input-field';
import { CheckboxFieldComponent } from '../../../fields/checkbox-field/checkbox-field';
import { AttributeValuesTabComponent } from '../attribute-values-tab/attribute-values-tab';
import { AttributeService } from '../../../../services/attribute.service';
import { PopupService } from '../../../../services/popup.service';
import { NotificationService } from '../../../../services/notification.service';
import { AttributeValuesStoreModel } from '../../../../models/attributes/attribute-values-store.model';
import { AttributeStoreModel } from '../../../../models/attributes/attribute-store.model';

@Component({
    selector: 'app-attributes-editor',
    standalone: true,
    imports: [
        FormsModule,
        InputFieldComponent,
        CheckboxFieldComponent,
        AttributeValuesTabComponent,
    ],
    templateUrl: './attributes-editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributesEditorComponent implements OnInit {
    private readonly attributeService = inject(AttributeService);
    private readonly popupService = inject(PopupService);
    private readonly notificationService = inject(NotificationService);

    id = input<number | null>(null);

    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    tab = signal<string>('info');

    guid = model<string>('');
    title = model<string>('');
    isDisplay = model<boolean>(false);
    isFilter = model<boolean>(false);

    values = signal<AttributeValuesStoreModel[]>([]);

    ngOnInit(): void {
        const attributeId = this.id();
        if (attributeId) {
            this.isEditMode.set(true);
            this.loadAttribute(attributeId);
        }
    }

    private async loadAttribute(id: number): Promise<void> {
        this.loading.set(true);
        try {
            const response = await this.attributeService.show(id);
            const attribute = response.data;
            this.guid.set(attribute.guid);
            this.title.set(attribute.title);
            this.isDisplay.set(attribute.is_display);
            this.isFilter.set(attribute.is_filter);
            this.values.set(attribute.values.map((v) => ({ id: v.id, value: v.value })));
        } catch (err) {
            this.notificationService.error('Не удалось загрузить данные характеристики');
        } finally {
            this.loading.set(false);
        }
    }

    async onSave(): Promise<void> {
        this.saving.set(true);

        try {
            const data: Partial<AttributeStoreModel> = {
                guid: this.guid().trim(),
                title: this.title().trim(),
                is_display: this.isDisplay(),
                is_filter: this.isFilter(),
                values: this.values(),
            };

            if (this.isEditMode()) {
                await this.attributeService.update(this.id()!, data);
            } else {
                await this.attributeService.create(data);
            }

            this.notificationService.success('Характеристика успешно сохранена');
            this.popupService.resolve();
        } catch (response: any) {
            this.notificationService.error(response.error.message);
        } finally {
            this.saving.set(false);
        }
    }

    onCancel(): void {
        this.popupService.resolve();
    }

    isActiveTab(tab: string): boolean {
        return this.tab() === tab;
    }

    changeTab(tab: string): void {
        this.tab.set(tab);
    }
}
