export interface UserModel {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    full_access: boolean;
    created_at: string;
    updated_at: string;
}
