import { TaskGroupModel } from './task-group.model';
import { UserShort } from './users/user-short.model';

export interface TaskModel {
    id: number;
    group_id: number;
    group?: TaskGroupModel;
    title: string;
    description: string | null;
    parent_id: number | null;
    created_by: number | null;
    assigned_to: number | null;
    creator?: UserShort | null;
    assignee?: UserShort | null;
    start_at: string;
    finish_at: string | null;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
}
