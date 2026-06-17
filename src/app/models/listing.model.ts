export interface ListingColumn {
    key: string;
    title: string;
    sortable?: boolean;
    width?: string;
    type?: 'text' | 'boolean';
    labels?: { true: string; false: string };
}
