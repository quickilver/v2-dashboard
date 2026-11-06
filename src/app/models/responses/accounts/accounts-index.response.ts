import { MetaModel } from '../../meta.model';
import { AccountModel } from '../../account.model';

export interface AccountsIndexResponse {
    data: AccountModel[];
    meta: MetaModel;
}

export interface AccountsShowResponse {
    data: AccountModel;
}
