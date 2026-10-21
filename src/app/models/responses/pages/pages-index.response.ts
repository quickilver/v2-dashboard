import { MetaModel } from '../../meta.model';
import { PageModel } from '../../page.model';

export interface PagesIndexResponse {
    data: PageModel[];
    meta: MetaModel;
}