import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IconService } from '../../core/services/icon.service';

@Component({
    selector: 'app-icon',
    template: ``,
    standalone: true,
    styles: []
})
export class IconComponent implements OnInit, OnChanges {
    @Input() name: string = '';
    @Input() size: number = 24;
    @Input() color: string = 'currentColor';

    constructor(
        private iconService: IconService,
        private elementRef: ElementRef
    ) {
    }

    async ngOnInit() {
        await this.loadIcon();
        this.applyStyles();
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['name']) {
            await this.loadIcon();
        }
        this.applyStyles();
    }

    private async loadIcon() {
        if (!this.name) return;

        this.elementRef.nativeElement.innerHTML = await this.iconService.getContent(this.name);
    }

    private applyStyles() {
        const sizeValue = `${this.size}px`;
        this.elementRef.nativeElement.style.width = sizeValue;
        this.elementRef.nativeElement.style.height = sizeValue;
        this.elementRef.nativeElement.style.color = this.color;
    }
}
