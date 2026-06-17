import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IconService } from '../../services/icon.service';

@Component({
    selector: 'app-icon',
    template: ``,
    standalone: true,
    styles: [],
})
export class IconComponent implements OnChanges {
    @Input() name: string = '';
    @Input() size: number = 24;
    @Input() color: string = 'currentColor';

    constructor(
        private iconService: IconService,
        private elementRef: ElementRef,
    ) {}

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['name']) {
            await this.loadIcon();
        }
        if (changes['size'] || changes['color']) {
            this.applyStyles();
        }
    }

    private async loadIcon() {
        if (!this.name) return;

        this.elementRef.nativeElement.innerHTML = await this.iconService.getContent(this.name);
        this.applyStyles();
    }

    private applyStyles() {
        const sizeValue = `${this.size}px`;
        this.elementRef.nativeElement.style.width = sizeValue;
        this.elementRef.nativeElement.style.height = sizeValue;
        this.elementRef.nativeElement.style.color = this.color;
    }
}
