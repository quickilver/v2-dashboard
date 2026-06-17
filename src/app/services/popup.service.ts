import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

type PopupResolver = () => void;

@Injectable({
    providedIn: 'root'
})
export class PopupService {
    private readonly _document: Document = inject(DOCUMENT);

    isShow: WritableSignal<boolean> = signal<boolean>(false);
    title: WritableSignal<string> = signal<string>('');
    component: WritableSignal<any> = signal<any>(null);
    inputs: WritableSignal<Record<string, unknown>> = signal<Record<string, unknown>>({});

    private _resolver: PopupResolver | null = null;

    private _lockScroll(): void {
        const scrollbarWidth = window.innerWidth - this._document.documentElement.clientWidth;
        this._document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        this._document.body.classList.add('popup-open');
    }

    private _unlockScroll(): void {
        this._document.body.classList.remove('popup-open');
        this._document.body.style.removeProperty('--scrollbar-width');
    }

    open(title: string, component: any, data?: Record<string, unknown>): Promise<void> {
        this.isShow.set(true);
        this.title.set(title);
        this.component.set(component);
        this.inputs.set(data ?? {});
        this._lockScroll();

        return new Promise((resolve) => {
            this._resolver = () => {
                this.isShow.set(false);
                this.title.set('');
                this.component.set(null);
                this.inputs.set({});
                resolve();
            };
        });
    }

    resolve(): void {
        if (this._resolver) {
            this._resolver();
            this._resolver = null;
        }
        this._unlockScroll();
    }
}
