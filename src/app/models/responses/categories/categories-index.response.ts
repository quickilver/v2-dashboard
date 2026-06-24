import { Category } from '../../category.model';
import { MetaModel } from '../../meta.model';

export interface CategoriesIndexResponse {
    data: Category[];
    meta: MetaModel;
}
