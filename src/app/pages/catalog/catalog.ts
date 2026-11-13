import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionPageComponent } from '../../components/section-page/section-page';

@Component({
    selector: 'app-catalog-page',
    standalone: true,
    imports: [SectionPageComponent],
    templateUrl: './catalog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPageComponent {}
