// services/icon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, map, shareReplay, catchError, of } from 'rxjs';

export interface IconConfig {
    name: string;
    size?: number | string;
    color?: string;
}

@Injectable({
    providedIn: 'root'
})
export class IconService {
    private cache = new Map<string, string>();

    async getContent(name: string): Promise<string> {

        if (this.cache.has(name)) {
            return this.cache.get(name)!;
        }

        try {
            const response = await fetch(`assets/icons/${name}.svg`);
            let svg: string = await response.text();

            svg = svg
                .replace(/fill="[^"]*"/g, 'fill="currentColor"')
                .replace(/stroke="[^"]*"/g, 'stroke="currentColor"');

            svg = svg.replace(/<svg /, `<svg class="icon" `);

            this.cache.set(name, svg);

            return svg;
        } catch (error) {
            console.error(`Иконка ${name} не загружена`);

            return '';
        }
    }
}
