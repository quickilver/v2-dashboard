import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModuleModel } from '../../models/module.model';
import { ModuleService } from '../../services/module.service';
import { IconComponent } from '../icon/icon';
import { SkeletonComponent } from '../skeleton/skeleton';

/**
 * Лендинг раздела админки: карточки-ссылки на подразделы,
 * доступные текущему пользователю.
 */
@Component({
    selector: 'app-section-page',
    standalone: true,
    imports: [RouterLink, IconComponent, SkeletonComponent],
    templateUrl: './section-page.html',
    styleUrl: './section-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionPageComponent implements OnInit {
    private readonly moduleService = inject(ModuleService);

    /** Заголовок страницы. */
    title = input<string>('');

    /** Подзаголовок под заголовком. */
    subtitle = input<string>('Разделы, доступные вам');

    /** Путь модуля-контейнера, чьи дочерние модули нужно показать. */
    sectionPath = input<string>('');

    /** Текст пустого состояния. */
    emptyText = input<string>('Обратитесь к администратору, чтобы получить доступ к разделам.');

    readonly loading = signal<boolean>(true);
    readonly sections = signal<ModuleModel[]>([]);

    ngOnInit(): void {
        this.loadSections();
    }

    private async loadSections(): Promise<void> {
        this.loading.set(true);

        try {
            const response = await this.moduleService.available();
            this.sections.set(this.resolveSections(response.data));
        } catch {
            this.sections.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Подразделы модуля-контейнера. Если путь не задан — показываем
     * все доступные листовые разделы.
     */
    private resolveSections(modules: ModuleModel[]): ModuleModel[] {
        const sectionPath = this.sectionPath();

        if (!sectionPath) {
            return modules.flatMap((module) =>
                module.children?.length ? module.children : [module],
            );
        }

        const section = modules.find((module) => module.path === sectionPath);

        return section?.children ?? [];
    }
}
