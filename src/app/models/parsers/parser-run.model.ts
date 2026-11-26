export interface ParserRun {
    id: number;
    mode: 'full' | 'quick';
    status:
        | 'queued'
        | 'running'
        | 'pausing'
        | 'paused'
        | 'completed'
        | 'completed_with_errors'
        | 'failed';
    total: number;
    processed: number;
    added: number;
    updated: number;
    unchanged: number;
    errors: number;
    current_path: string | null;
    message: string | null;
    created_at: string;
    started_at: string | null;
    finished_at: string | null;
}
