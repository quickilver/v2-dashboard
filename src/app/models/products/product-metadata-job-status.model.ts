import type { GeneratedProductMetadata } from './generated-product-metadata.model';

export type ProductMetadataJobStatus =
    | { status: 'pending' }
    | { status: 'completed'; data: GeneratedProductMetadata }
    | { status: 'failed'; message: string };
