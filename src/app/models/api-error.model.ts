export interface ApiErrorModel {
    error: {
        message: string;
    },
    message: string;
    ok: boolean;
    status: number;
    statusText: string;
    url: string;
}
