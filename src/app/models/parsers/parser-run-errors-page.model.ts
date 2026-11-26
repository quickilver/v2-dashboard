import { ParserRunError } from './parser-run-error.model';

export interface ParserRunErrorsPage {
    data: ParserRunError[];
    current_page: number;
    last_page: number;
    can_retry: boolean;
}
