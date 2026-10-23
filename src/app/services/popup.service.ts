import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

type PopupResolver = () => void;

export interface PopupEntry {
    id: number;
    title: string;
    component: any;
    inputs: Record<string, unknown>;
    dialogClass: string;
}

@Injectable({
    providedIn: 'root',
})
export class PopupService {
    private readonly _document: Document = inject(DOCUMENT);

    stack: WritableSignal<PopupEntry[]> = signal<PopupEntry[]>([]);

    private _nextId = 1;
    private _resolvers = new Map<number, PopupResolver>();

    private _lockScroll(): void {
        const scrollbarWidth = window.innerWidth - this._document.documentElement.clientWidth;
        this._document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        this._document.body.classList.add('popup-open');
    }

    private _unlockScroll(): void {
        this._document.body.classList.remove('popup-open');
        this._document.body.style.removeProperty('--scrollbar-width');
    }

    open(
        title: string,
        component: any,
        data?: Record<string, unknown>,
        dialogClass: string = '',
    ): Promise<void> {
        const id = this._nextId++;
        const entry: PopupEntry = {
            id,
            title,
            component,
            inputs: data ?? {},
            dialogClass,
        };

        this.stack.update((list) => [entry, ...list]);

        if (this.stack().length === 1) {
            this._lockScroll();
        }

        return new Promise((resolve) => {
            this._resolvers.set(id, () => {
                this.stack.update((list) => list.filter((e) => e.id !== id));
                this._resolvers.delete(id);

                if (this.stack().length === 0) {
                    this._unlockScroll();
                }

                resolve();
            });
        });
    }

    resolve(): void {
        const stack = this.stack();
        if (stack.length === 0) return;

        const top = stack[0];
        const resolver = this._resolvers.get(top.id);
        if (resolver) {
            resolver();
        }
    }
}
