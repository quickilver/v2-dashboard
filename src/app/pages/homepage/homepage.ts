import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FileManagerInitComponent } from '../../components/file-manager/file-manager-init/file-manager-init';

@Component({
    selector: 'app-homepage',
    standalone: true,
    imports: [FileManagerInitComponent],
    templateUrl: './homepage.html',
    styleUrl: './homepage.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomepageComponent {}
