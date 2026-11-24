import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Installment } from '../domain/model/installment.entity';
import { PaymentDue } from '../domain/model/payment-due.entity';
import { InstallmentAssembler } from './installment-assembler';
import { InstallmentResource, InstallmentsResponse } from './installment-response';

export class InstallmentsApiEndpoint {
  private assembler = new InstallmentAssembler();
  constructor(private http: HttpClient) {}

  // US-07: plan de cuotas con estado real
  listBySale(creditSaleId: number): Observable<Installment[]> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-sales/${creditSaleId}/installments`;
    return this.http.get<InstallmentResource[] | InstallmentsResponse>(url).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as InstallmentsResponse)),
    );
  }

  // US-05: vencimientos del día por tienda
  listDueByStore(storeId: number): Observable<Installment[]> {
    const url = `${environment.apiBaseUrl}/api/v1/stores/${storeId}/installments-due`;
    return this.http.get<InstallmentResource[] | InstallmentsResponse>(url).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as InstallmentsResponse)),
    );
  }

  // US-05 / US-10: desglose exigible (capital + interés + mora)
  paymentDue(creditProfileId: number, installmentIds: number[]): Observable<PaymentDue> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-profiles/${creditProfileId}/payment-due`;
    const params = new HttpParams().set('installmentIds', installmentIds.join(','));
    return this.http.get<PaymentDue>(url, { params });
  }
}
