import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { CreditSalesApiEndpoint, RegisterCreditSalePayload } from './credit-sales-api-endpoint';
import { environment } from '../../../environments/environment';
import { SaleModality } from '../domain/model/credit-sale.entity';

function makeHttp(responseFactory: (url: string) => unknown) {
  const calls: Array<{ method: string; url: string; body: unknown }> = [];
  const http = {
    post: (url: string, body: unknown): Observable<unknown> => {
      calls.push({ method: 'POST', url, body });
      return of(responseFactory(url));
    },
    get: (url: string): Observable<unknown> => {
      calls.push({ method: 'GET', url, body: null });
      return of(responseFactory(url));
    },
  } as unknown as HttpClient;
  return { http, calls };
}

const payload: RegisterCreditSalePayload = {
  items: [],
  installmentCount: 3,
  graceDays: 0,
  modality: SaleModality.INSTALLMENTS,
};

describe('CreditSalesApiEndpoint - URLs y payloads', () => {
  it('simulate POST a /credit-profiles/{id}/credit-sale-simulations', () => {
    const { http, calls } = makeHttp(() => ({ schedule: [] }));
    new CreditSalesApiEndpoint(http).simulate(10, payload).subscribe();
    expect(calls[0]).toEqual({
      method: 'POST',
      url: `${environment.apiBaseUrl}/api/v1/credit-profiles/10/credit-sale-simulations`,
      body: payload,
    });
  });

  it('register POST a /credit-profiles/{id}/credit-sales', () => {
    const { http, calls } = makeHttp(() => ({
      id: 1, creditProfileId: 10, storeId: 100, items: [], totalAmount: 0,
      installmentCount: 3, graceDays: 0, modality: 'INSTALLMENTS',
      interestRateSnapshot: 0, interestRateTypeSnapshot: 'NOMINAL',
      capitalizationPeriodSnapshot: null, lateInterestRateSnapshot: 0,
      lateInterestRateTypeSnapshot: 'NOMINAL', paymentPlan: null,
      status: 'ACTIVE', saleDate: '2026-11-23',
    }));
    new CreditSalesApiEndpoint(http).register(10, payload).subscribe();
    expect(calls[0].method).toBe('POST');
    expect(calls[0].url).toBe(`${environment.apiBaseUrl}/api/v1/credit-profiles/10/credit-sales`);
  });

  it('paymentPlan GET a /credit-sales/{id}/payment-plan (US-07 pendiente #2)', () => {
    const { http, calls } = makeHttp(() => ({ schedule: [] }));
    new CreditSalesApiEndpoint(http).paymentPlan(99).subscribe();
    expect(calls[0]).toEqual({
      method: 'GET',
      url: `${environment.apiBaseUrl}/api/v1/credit-sales/99/payment-plan`,
      body: null,
    });
  });

  it('get GET a /credit-sales/{id}', () => {
    const { http, calls } = makeHttp(() => ({
      id: 7, creditProfileId: 10, storeId: 100, items: [], totalAmount: 0,
      installmentCount: 3, graceDays: 0, modality: 'INSTALLMENTS',
      interestRateSnapshot: 0, interestRateTypeSnapshot: 'NOMINAL',
      capitalizationPeriodSnapshot: null, lateInterestRateSnapshot: 0,
      lateInterestRateTypeSnapshot: 'NOMINAL', paymentPlan: null,
      status: 'ACTIVE', saleDate: '2026-11-23',
    }));
    new CreditSalesApiEndpoint(http).get(7).subscribe();
    expect(calls[0].url).toBe(`${environment.apiBaseUrl}/api/v1/credit-sales/7`);
  });
});
