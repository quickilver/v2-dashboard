import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon';

@Component({
    selector: 'app-reports-page',
    standalone: true,
    imports: [RouterLink, IconComponent],
    templateUrl: './reports.html',
    styleUrl: './reports.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent {}
