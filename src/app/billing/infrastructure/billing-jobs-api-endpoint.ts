import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Pendiente #4 — triggers manuales del BillingScheduler (SYSTEM_ADMIN).
 * No existe un recurso REST con GET/POST uniformes: son dos endpoints de
 * accion, cada uno acepta `?asOf=YYYY-MM-DD` opcional. El backend responde
 * 202 Accepted y lanza el job en background.
 */
export class BillingJobsApiEndpoint {
  private base = `${environment.apiBaseUrl}/api/v1/admin/billing/jobs`;
  constructor(private http: HttpClient) {}

  runOverdueSweep(asOf?: string): Observable<void> {
    let params = new HttpParams();
    if (asOf) params = params.set('asOf', asOf);
    return this.http.post<void>(`${this.base}/overdue-sweep`, null, { params });
  }
  runAccountStatements(asOf?: string): Observable<void> {
    let params = new HttpParams();
    if (asOf) params = params.set('asOf', asOf);
    return this.http.post<void>(`${this.base}/account-statements`, null, { params });
  }
}
