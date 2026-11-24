import { HttpClient, HttpParams } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { InstallmentsApiEndpoint } from './installments-api-endpoint';
import { environment } from '../../../environments/environment';

function makeHttp() {
  const calls: Array<{ url: string; params: HttpParams | null }> = [];
  const http = {
    get: (url: string, options?: { params?: HttpParams }): Observable<unknown> => {
      calls.push({ url, params: options?.params ?? null });
      return of([]);
    },
  } as unknown as HttpClient;
  return { http, calls };
}

describe('InstallmentsApiEndpoint', () => {
  it('listBySale llama a /credit-sales/{id}/installments', () => {
    const { http, calls } = makeHttp();
    new InstallmentsApiEndpoint(http).listBySale(42).subscribe();
    expect(calls[0].url).toBe(`${environment.apiBaseUrl}/api/v1/credit-sales/42/installments`);
  });

  it('listDueByStore llama a /stores/{id}/installments-due', () => {
    const { http, calls } = makeHttp();
    new InstallmentsApiEndpoint(http).listDueByStore(7).subscribe();
    expect(calls[0].url).toBe(`${environment.apiBaseUrl}/api/v1/stores/7/installments-due`);
  });

  it('paymentDue envia installmentIds como CSV en query param (regla US-05)', () => {
    const { http, calls } = makeHttp();
    new InstallmentsApiEndpoint(http).paymentDue(10, [1, 2, 3]).subscribe();
    expect(calls[0].url).toBe(`${environment.apiBaseUrl}/api/v1/credit-profiles/10/payment-due`);
    expect(calls[0].params?.get('installmentIds')).toBe('1,2,3');
  });
});
