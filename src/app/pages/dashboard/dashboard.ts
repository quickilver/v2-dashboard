import { Component } from '@angular/core';
import { InputFieldComponent } from '../../components/fields/input-field/input-field';
import { IconComponent } from '../../components/icon/icon';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        InputFieldComponent,
        IconComponent
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class DashboardComponent {

}
