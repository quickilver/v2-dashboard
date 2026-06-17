import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation';
import { UserInfoComponent } from '../user-info/user-info';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, NavigationComponent, UserInfoComponent],
    templateUrl: './layout.html',
    styleUrl: './layout.scss',
})
export class LayoutComponent {}
