import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InputFieldComponent } from '../../components/fields/input-field/input-field';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [InputFieldComponent, FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    private readonly authService = inject(AuthService);
    private readonly notificationService = inject(NotificationService);
    private readonly router = inject(Router);

    readonly email = signal('');
    readonly password = signal('');
    readonly loading = signal(false);

    async onSubmit(): Promise<void> {
        if (!this.email() || !this.password()) {
            this.notificationService.error('Заполните E-mail и пароль');

            return;
        }

        this.loading.set(true);

        try {
            await this.authService.login(this.email(), this.password());
            await this.router.navigate(['/']);

            this.notificationService.success('Добро пожаловать ' + this.authService.user()?.name);
        } catch {
            this.notificationService.error('Неверный E-mail или пароль');
        } finally {
            this.loading.set(false);
        }
    }
}
