import { MetaModel } from '../../meta.model';
import { LogModel } from '../../log.model';

export interface LogsIndexResponse {
    data: LogModel[];
    meta: MetaModel;
}