import { HttpClient, HttpParams } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { BillingJobsApiEndpoint } from './billing-jobs-api-endpoint';
import { environment } from '../../../environments/environment';

function makeHttp() {
  const calls: Array<{ url: string; body: unknown; params: HttpParams | null }> = [];
  const http = {
    post: (url: string, body: unknown, options?: { params?: HttpParams }): Observable<unknown> => {
      calls.push({ url, body, params: options?.params ?? null });
      return of(void 0);
    },
  } as unknown as HttpClient;
  return { http, calls };
}

describe('BillingJobsApiEndpoint', () => {
  it('runOverdueSweep sin asOf llama a /admin/billing/jobs/overdue-sweep sin params', () => {
    const { http, calls } = makeHttp();
    new BillingJobsApiEndpoint(http).runOverdueSweep().subscribe();
    expect(calls[0].url).toBe(`${environment.apiBaseUrl}/api/v1/admin/billing/jobs/overdue-sweep`);
    expect(calls[0].params?.has('asOf')).toBe(false);
    expect(calls[0].body).toBeNull();
  });

  it('runOverdueSweep con asOf lo envia como query param', () => {
    const { http, calls } = makeHttp();
    new BillingJobsApiEndpoint(http).runOverdueSweep('2026-11-23').subscribe();
    expect(calls[0].params?.get('asOf')).toBe('2026-11-23');
  });

  it('runAccountStatements apunta a /account-statements y acepta asOf', () => {
    const { http, calls } = makeHttp();
    new BillingJobsApiEndpoint(http).runAccountStatements('2026-12-31').subscribe();
    expect(calls[0].url).toBe(`${environment.apiBaseUrl}/api/v1/admin/billing/jobs/account-statements`);
    expect(calls[0].params?.get('asOf')).toBe('2026-12-31');
  });
});
