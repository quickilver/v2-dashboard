import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {

}
