import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { LayoutComponent } from './components/layout/layout';
import { LoginComponent } from './pages/login/login';
import { ConfirmComponent } from './components/confirm/confirm';
import { PopupComponent } from './components/popup/popup';
import { NotificationComponent } from './components/notification/notification';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        LayoutComponent,
        LoginComponent,
        ConfirmComponent,
        PopupComponent,
        NotificationComponent,
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly authService = inject(AuthService);
}
