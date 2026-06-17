import { AttributeValuesStoreModel } from './attribute-values-store.model';

export interface AttributeStoreModel {
    id: number;
    guid: string;
    title: string;
    is_display: boolean;
    is_filter: boolean;
    values: AttributeValuesStoreModel[];
    created_at: string;
    updated_at: string;
}
