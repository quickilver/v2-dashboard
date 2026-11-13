import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModuleService } from '../../services/module.service';
import { ModuleModel } from '../../models/module.model';
import { IconComponent } from '../../components/icon/icon';
import { SkeletonComponent } from '../../components/skeleton/skeleton';

@Component({
    selector: 'app-homepage',
    standalone: true,
    imports: [RouterLink, IconComponent, SkeletonComponent],
    templateUrl: './homepage.html',
    styleUrl: './homepage.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomepageComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly moduleService = inject(ModuleService);

    readonly userName = computed<string>(() => this.authService.user()?.name ?? '');
    readonly greeting = computed<string>(() => this.resolveGreeting(new Date().getHours()));
    readonly welcomeTitle = computed<string>(() =>
        this.userName() ? `Добро пожаловать, ${this.userName()}!` : 'Добро пожаловать!',
    );
    readonly today = computed<string>(() =>
        new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long',
        }),
    );

    readonly loading = signal<boolean>(true);
    readonly sections = signal<ModuleModel[]>([]);

    ngOnInit(): void {
        this.loadSections();
    }

    private async loadSections(): Promise<void> {
        this.loading.set(true);

        try {
            const response = await this.moduleService.available();
            this.sections.set(response.data);
        } catch {
            this.sections.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    private resolveGreeting(hour: number): string {
        if (hour < 6) {
            return 'Доброй ночи';
        }

        if (hour < 12) {
            return 'Доброе утро';
        }

        if (hour < 18) {
            return 'Добрый день';
        }

        return 'Добрый вечер';
    }
}
