import { Component, signal } from '@angular/core';
import { LayoutComponent } from './components/layout/layout';
import { ConfirmComponent } from './components/confirm/confirm';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, ConfirmComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('vibe-admin');
}
