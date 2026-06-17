import { AttributeValueModel } from './attribute-value.model';

export interface AttributeFullModel {
    id: number;
    guid: string;
    title: string;
    is_display: boolean;
    is_filter: boolean;
    values: AttributeValueModel[];
    created_at: string;
    updated_at: string;
}
