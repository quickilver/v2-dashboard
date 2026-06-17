import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface IconConfig {
    name: string;
    size?: number | string;
    color?: string;
}

@Injectable({
    providedIn: 'root',
})
export class IconService {
    private cache = new Map<string, string>();
    private pending = new Map<string, Promise<string>>();
    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    async getContent(name: string): Promise<string> {
        if (!name) return '';

        if (this.cache.has(name)) {
            return this.cache.get(name)!;
        }

        if (this.pending.has(name)) {
            return this.pending.get(name)!;
        }

        if (!this.isBrowser) {
            this.cache.set(name, '');
            return '';
        }

        const promise = this.fetchIcon(name);
        this.pending.set(name, promise);

        const result = await promise;
        this.pending.delete(name);
        return result;
    }

    private async fetchIcon(name: string): Promise<string> {
        try {
            const response = await fetch(`/assets/icons/${name}.svg`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            let svg: string = await response.text();

            svg = svg
                .replace(/fill="(?!none\b)(?!transparent\b)[^"]*"/g, 'fill="currentColor"')
                .replace(/stroke="[^"]*"/g, 'stroke="currentColor"');

            svg = svg.replace(/<svg /, `<svg class="icon" `);

            this.cache.set(name, svg);

            return svg;
        } catch (error) {
            console.error(`Иконка ${name} не загружена`);

            this.cache.set(name, '');

            return '';
        }
    }
}
