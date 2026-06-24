import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CategoriesTreeComponent } from '../../../categories-tree/categories-tree';

@Component({
    selector: 'app-categories-listing',
    standalone: true,
    imports: [CategoriesTreeComponent],
    templateUrl: './categories-listing.html',
    styleUrl: './categories-listing.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesListingComponent {}
