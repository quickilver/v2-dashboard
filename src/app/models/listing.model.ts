export interface ListingColumn {
    key: string;
    title: string;
    sortable?: boolean;
    width?: string;
    type?: 'text' | 'boolean' | 'link' | 'image';
    labels?: { true: string; false: string };
    isDefault?: boolean;
    formatter?: (row: any) => string;
    imageUrl?: (row: any) => string;
}
