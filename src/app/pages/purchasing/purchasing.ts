import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionPageComponent } from '../../components/section-page/section-page';

@Component({
    selector: 'app-purchasing-page',
    standalone: true,
    imports: [SectionPageComponent],
    templateUrl: './purchasing.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchasingPageComponent {}
