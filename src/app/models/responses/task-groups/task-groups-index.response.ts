import { MetaModel } from '../../meta.model';
import { TaskGroupModel } from '../../task-group.model';

export interface TaskGroupsIndexResponse {
    data: TaskGroupModel[];
    meta: MetaModel;
}
