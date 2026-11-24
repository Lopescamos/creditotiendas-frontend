import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OperationLog } from '../domain/model/operation-log.entity';
import { OperationLogAssembler } from './operation-log-assembler';
import { OperationLogResource, OperationLogsResponse } from './operation-log-response';

export interface OperationLogsFilter {
  userId?: number; action?: string; entity?: string; from?: string; to?: string;
}

export class OperationLogsApiEndpoint {
  private assembler = new OperationLogAssembler();
  private url = `${environment.apiBaseUrl}/api/v1/operation-logs`;
  constructor(private http: HttpClient) {}
  list(f: OperationLogsFilter = {}): Observable<OperationLog[]> {
    let params = new HttpParams();
    if (f.userId != null) params = params.set('userId', String(f.userId));
    if (f.action)         params = params.set('action', f.action);
    if (f.entity)         params = params.set('entity', f.entity);
    if (f.from)           params = params.set('from', f.from);
    if (f.to)             params = params.set('to', f.to);
    return this.http.get<OperationLogResource[] | OperationLogsResponse>(this.url, { params }).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as OperationLogsResponse)),
    );
  }
}
