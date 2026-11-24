import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Payment } from '../domain/model/payment.entity';
import { PaymentAssembler } from './payment-assembler';
import { PaymentResource, PaymentsResponse } from './payment-response';

/**
 * US-05: Backend calcula el monto a partir de installmentIds; el cliente NO manda el monto.
 * Prelación mora → interés → capital se aplica en el backend.
 * No hay pagos parciales: el backend rechaza montos distintos al exigible.
 */
export class PaymentsApiEndpoint {
  private assembler = new PaymentAssembler();
  constructor(private http: HttpClient) {}

  register(creditProfileId: number, installmentIds: number[]): Observable<Payment> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-profiles/${creditProfileId}/payments`;
    return this.http.post<PaymentResource>(url, { installmentIds })
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  listByProfile(creditProfileId: number): Observable<Payment[]> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-profiles/${creditProfileId}/payments`;
    return this.http.get<PaymentResource[] | PaymentsResponse>(url).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as PaymentsResponse)),
    );
  }
}
