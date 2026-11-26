import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ParserRun } from '../models/parsers/parser-run.model';
import { ParserRunErrorsPage } from '../models/parsers/parser-run-errors-page.model';
import { ParserRunsPage } from '../models/parsers/parser-runs-page.model';

@Injectable({ providedIn: 'root' })
export class ParserService {
    private readonly http: HttpClient = inject(HttpClient);
    private readonly url: string = `${environment.apiUrl}/parser/runs`;

    index(page: number): Promise<ParserRunsPage> {
        return firstValueFrom(this.http.get<ParserRunsPage>(this.url, { params: { page } }));
    }

    errors(runId: number, page: number): Promise<ParserRunErrorsPage> {
        return firstValueFrom(
            this.http.get<ParserRunErrorsPage>(`${this.url}/${runId}/errors`, { params: { page } }),
        );
    }

    create(mode: ParserRun['mode']): Promise<ParserRun> {
        return firstValueFrom(this.http.post<ParserRun>(this.url, { mode }));
    }

    retryErrors(runId: number): Promise<ParserRun> {
        return firstValueFrom(this.http.post<ParserRun>(`${this.url}/${runId}/retry-errors`, {}));
    }

    changeStatus(runId: number, action: 'pause' | 'resume'): Promise<ParserRun> {
        return firstValueFrom(this.http.post<ParserRun>(`${this.url}/${runId}/${action}`, {}));
    }
}
