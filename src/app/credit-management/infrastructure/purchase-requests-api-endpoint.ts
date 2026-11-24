import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PurchaseRequest } from '../domain/model/purchase-request.entity';
import { PurchaseRequestAssembler } from './purchase-request-assembler';
import { PurchaseRequestResource, PurchaseRequestsResponse } from './purchase-request-response';
import { PurchaseRequestEligibility } from '../domain/model/eligibility.entity';

export class PurchaseRequestsApiEndpoint {
  private assembler = new PurchaseRequestAssembler();
  constructor(private http: HttpClient) {}

  // Admin negocio — bandeja por tienda (US-12)
  listByStore(storeId: number, status?: string): Observable<PurchaseRequest[]> {
    const url = `${environment.apiBaseUrl}/api/v1/stores/${storeId}/purchase-requests`;
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<PurchaseRequestResource[] | PurchaseRequestsResponse>(url, { params }).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as PurchaseRequestsResponse)),
    );
  }

  approve(id: number): Observable<PurchaseRequest> {
    const url = `${environment.apiBaseUrl}/api/v1/purchase-requests/${id}/approval`;
    return this.http.post<PurchaseRequestResource>(url, {})
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  reject(id: number, reason: string): Observable<PurchaseRequest> {
    const url = `${environment.apiBaseUrl}/api/v1/purchase-requests/${id}/rejection`;
    return this.http.post<PurchaseRequestResource>(url, { reason })
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }

  // Cliente — endpoints usados por app Android (expuestos aquí para referencia)
  eligibility(creditProfileId: number): Observable<PurchaseRequestEligibility> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-profiles/${creditProfileId}/purchase-request-eligibility`;
    return this.http.get<PurchaseRequestEligibility>(url);
  }
}
