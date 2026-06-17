import { User } from '../../user.model';

export interface AuthLoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}