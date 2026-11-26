import type { AttributeValueModel } from '../../../../models/attributes/attribute-value.model';

export interface AttributeFilterView {
    id: number;
    title: string;
    values: AttributeValueModel[];
    selectedValues: number[];
    loading: boolean;
}
