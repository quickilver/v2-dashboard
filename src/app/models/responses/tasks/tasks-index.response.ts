import { MetaModel } from '../../meta.model';
import { TaskModel } from '../../task.model';

export interface TasksIndexResponse {
    data: TaskModel[];
    meta: MetaModel;
}
