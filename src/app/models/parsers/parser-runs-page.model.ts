import { ParserRun } from './parser-run.model';

export interface ParserRunsPage {
    data: ParserRun[];
    current_page: number;
    last_page: number;
}
