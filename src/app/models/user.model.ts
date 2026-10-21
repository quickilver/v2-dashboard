export interface UserModel {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    full_access: boolean;
    permissions?: number[] | { id: number }[];
    created_at: string;
    updated_at: string;
}
