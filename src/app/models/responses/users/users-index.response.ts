import { MetaModel } from '../../meta.model';
import { UserShort } from '../../users/user-short.model';

export interface UsersIndexResponse {
    data: UserShort[];
    meta: MetaModel;
}