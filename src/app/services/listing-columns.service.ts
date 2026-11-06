import { Injectable } from '@angular/core';
import { ListingColumn } from '../models/listing.model';

@Injectable({
    providedIn: 'root',
})
export class ListingColumnsService {
    private readonly storagePrefix = 'listing_columns:';

    getColumns(storageKey: string, available: ListingColumn[]): ListingColumn[] {
        if (!storageKey || available.length === 0) {
            return this.getDefaultColumns(available);
        }

        const savedKeys = this.getSavedKeys(storageKey);

        if (!savedKeys || savedKeys.length === 0) {
            return this.getDefaultColumns(available);
        }

        const columnsByKey = new Map(available.map((column) => [column.key, column]));
        const result: ListingColumn[] = [];

        for (const key of savedKeys) {
            const column = columnsByKey.get(key);

            if (column) {
                result.push(column);
                columnsByKey.delete(key);
            }
        }

        return result.length > 0 ? result : this.getDefaultColumns(available);
    }

    getDefaultColumns(available: ListingColumn[]): ListingColumn[] {
        const defaults = available.filter((column) => column.isDefault);

        return defaults.length > 0 ? defaults : available;
    }

    saveColumns(storageKey: string, keys: string[]): void {
        if (!storageKey || typeof window === 'undefined') {
            return;
        }

        localStorage.setItem(this.storagePrefix + storageKey, JSON.stringify(keys));
    }

    reset(storageKey: string): void {
        if (!storageKey || typeof window === 'undefined') {
            return;
        }

        localStorage.removeItem(this.storagePrefix + storageKey);
    }

    private getSavedKeys(storageKey: string): string[] | null {
        if (typeof window === 'undefined') {
            return null;
        }

        const raw = localStorage.getItem(this.storagePrefix + storageKey);

        if (!raw) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw);

            return Array.isArray(parsed) ? parsed.filter((key) => typeof key === 'string') : null;
        } catch {
            return null;
        }
    }
}
