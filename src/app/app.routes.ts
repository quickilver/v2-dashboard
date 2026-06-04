import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { UsersComponent } from './pages/users/users';
import { SettingsComponent } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'settings', component: SettingsComponent },
];
