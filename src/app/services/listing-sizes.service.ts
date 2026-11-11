import { Injectable } from '@angular/core';
import { ListingSize } from '../models/listing.model';

@Injectable({
    providedIn: 'root',
})
export class ListingSizesService {
    private readonly storagePrefix = 'listing_size:';
    private readonly defaultSize: ListingSize = 'normal';
    private readonly availableSizes: ListingSize[] = ['large', 'normal', 'small'];

    getSize(storageKey: string): ListingSize {
        if (!storageKey || typeof window === 'undefined') {
            return this.defaultSize;
        }

        const saved = localStorage.getItem(this.storagePrefix + storageKey);

        return this.isAvailable(saved) ? saved : this.defaultSize;
    }

    saveSize(storageKey: string, size: ListingSize): void {
        if (!storageKey || typeof window === 'undefined') {
            return;
        }

        localStorage.setItem(this.storagePrefix + storageKey, size);
    }

    reset(storageKey: string): void {
        if (!storageKey || typeof window === 'undefined') {
            return;
        }

        localStorage.removeItem(this.storagePrefix + storageKey);
    }

    private isAvailable(value: string | null): value is ListingSize {
        return !!value && this.availableSizes.includes(value as ListingSize);
    }
}
