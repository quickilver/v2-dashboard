import { UserModel } from './user.model';

export type LogEvent = 'updated' | 'created' | 'deleted' | 'restored';

export interface LogModel {
    id: number;
    event: LogEvent;
    model_type: string;
    model_id: number;
    user_id: number;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    created_at: string;
    user: UserModel;
}