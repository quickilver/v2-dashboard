export interface AccountModel {
    id: number;
    guid: string | null;
    phone: number | null;
    email: string | null;
    first_name: string;
    last_name: string | null;
    middle_name: string | null;
    is_blocked: boolean;
    created_at: string;
    updated_at: string;
}
