import { inject, Injectable, signal, WritableSignal } from '@angular/core';

type ConfirmResolver = (result: boolean) => void;

@Injectable({
    providedIn: 'root',
})
export class ConfirmService {
    isShow: WritableSignal<boolean> = signal<boolean>(false);

    title: WritableSignal<string | null> = signal<string | null>(null);
    description: WritableSignal<string | null> = signal<string | null>(null);
    confirmLabel: WritableSignal<string | null> = signal<string | null>('Продолжить');
    cancelLabel: WritableSignal<string | null> = signal<string | null>('Отмена');

    private _resolver: ConfirmResolver | null = null;

    confirm(
        title: string,
        description: string,
        confirmLabel: string = 'Продолжить',
        cancelLabel: string = 'Отмена',
    ): Promise<boolean> {
        this.isShow.set(true);
        this.title.set(title);
        this.description.set(description);
        this.confirmLabel.set(confirmLabel);
        this.cancelLabel.set(cancelLabel);

        return new Promise((resolve) => {
            this._resolver = (result: boolean) => {
                this.title.set(null);
                this.description.set(null);
                this.confirmLabel.set(null);
                this.cancelLabel.set(null);

                this.isShow.set(false);

                resolve(result);
            };
        });
    }

    resolve(result: boolean): void {
        if (this._resolver) {
            this._resolver(result);
            this._resolver = null;
        }
    }
}
