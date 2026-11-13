import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionPageComponent } from '../../components/section-page/section-page';

@Component({
    selector: 'app-content-page',
    standalone: true,
    imports: [SectionPageComponent],
    templateUrl: './content.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentPageComponent {}
