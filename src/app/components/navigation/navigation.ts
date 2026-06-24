import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavigationItem } from '../../models/navigation-item.model';
import { ModuleModel } from '../../models/module.model';
import { ModuleService } from '../../services/module.service';
import { IconComponent } from '../icon/icon';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [RouterLink, IconComponent],
    templateUrl: './navigation.html',
    styleUrl: './navigation.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
    readonly navigation = signal<NavigationItem[]>([]);

    private readonly modulesService = inject(ModuleService);

    constructor() {
        this.loadNavigation();
    }

    private async loadNavigation(): Promise<void> {
        const response = await this.modulesService.index();
        this.navigation.set(response.data.map((module) => this.mapModuleToNavigation(module)));
    }

    private mapModuleToNavigation(module: ModuleModel): NavigationItem {
        return {
            title: module.title,
            route: module.path,
            icon: module.icon,
            children: module.children?.length
                ? module.children.map((child) => this.mapModuleToNavigation(child))
                : undefined,
        };
    }
}
