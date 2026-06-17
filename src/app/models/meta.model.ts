import { MetaLinkModel } from './meta-link.model';

export interface MetaModel {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    links: MetaLinkModel[];
}
