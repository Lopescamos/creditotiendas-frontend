import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreditSale } from '../domain/model/credit-sale.entity';
import { PaymentPlan } from '../domain/model/payment-plan.entity';
import { SaleLineItem } from '../domain/model/line-item.entity';
import { CreditSaleAssembler } from './credit-sale-assembler';
import { CreditSaleResource, CreditSalesResponse } from './credit-sale-response';

export interface RegisterCreditSalePayload {
  items: SaleLineItem[];
  installmentCount: number;
  graceDays: number;
  modality: string;
}

export class CreditSalesApiEndpoint {
  private assembler = new CreditSaleAssembler();
  constructor(private http: HttpClient) {}

  simulate(creditProfileId: number, payload: RegisterCreditSalePayload): Observable<PaymentPlan> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-profiles/${creditProfileId}/credit-sale-simulations`;
    return this.http.post<PaymentPlan>(url, payload);
  }
  register(creditProfileId: number, payload: RegisterCreditSalePayload): Observable<CreditSale> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-profiles/${creditProfileId}/credit-sales`;
    return this.http.post<CreditSaleResource>(url, payload)
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  listByProfile(creditProfileId: number): Observable<CreditSale[]> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-profiles/${creditProfileId}/credit-sales`;
    return this.http.get<CreditSaleResource[] | CreditSalesResponse>(url).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as CreditSalesResponse)),
    );
  }
  get(id: number): Observable<CreditSale> {
    return this.http.get<CreditSaleResource>(`${environment.apiBaseUrl}/api/v1/credit-sales/${id}`)
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  paymentPlan(id: number): Observable<PaymentPlan> {
    return this.http.get<PaymentPlan>(`${environment.apiBaseUrl}/api/v1/credit-sales/${id}/payment-plan`);
  }
}
