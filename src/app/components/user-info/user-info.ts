import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../icon/icon';

@Component({
    selector: 'app-user-info',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './user-info.html',
    styleUrl: './user-info.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent {
    protected readonly authService = inject(AuthService);

    protected handleLogout(): void {
        this.authService.logout();
    }
}
