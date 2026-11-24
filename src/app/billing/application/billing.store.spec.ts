import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { of, throwError, Observable } from 'rxjs';
import { vi } from 'vitest';
import { BillingStore } from './billing.store';
import { InstallmentsApiEndpoint } from '../infrastructure/installments-api-endpoint';
import { PaymentsApiEndpoint } from '../infrastructure/payments-api-endpoint';
import { PaymentDue } from '../domain/model/payment-due.entity';
import { Payment } from '../domain/model/payment.entity';
import { environment } from '../../../environments/environment';

const anHttp = {} as HttpClient;
const aDue: PaymentDue = { capital: 100, interes: 10, mora: 5, total: 115 } as unknown as PaymentDue;
const aPayment = { id: 77 } as unknown as Payment;

describe('BillingStore', () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BillingStore,
        { provide: HttpClient, useValue: anHttp },
      ],
    });
  });

  it('loadPaymentDue con 0 installmentIds limpia el due y NO llama al endpoint', () => {
    const spy = vi.spyOn(InstallmentsApiEndpoint.prototype, 'paymentDue');
    const store = TestBed.inject(BillingStore);
    store.loadPaymentDue(10, []);
    expect(store.due()).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('loadPaymentDue con ids setea el desglose devuelto por el backend', () => {
    vi.spyOn(InstallmentsApiEndpoint.prototype, 'paymentDue').mockReturnValue(of(aDue));
    const store = TestBed.inject(BillingStore);
    store.loadPaymentDue(10, [1, 2]);
    expect(store.due()).toEqual(aDue);
  });

  it('registerPayment agrega el pago, apaga loading y limpia el due', () => {
    vi.spyOn(InstallmentsApiEndpoint.prototype, 'paymentDue').mockReturnValue(of(aDue));
    vi.spyOn(PaymentsApiEndpoint.prototype, 'register').mockReturnValue(of(aPayment));

    const store = TestBed.inject(BillingStore);
    store.loadPaymentDue(10, [1]);
    expect(store.due()).not.toBeNull();

    store.registerPayment(10, [1]);

    expect(store.payments()).toEqual([aPayment]);
    expect(store.due()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('registerPayment fallido no agrega pago y conserva el due para reintentar', () => {
    vi.spyOn(InstallmentsApiEndpoint.prototype, 'paymentDue').mockReturnValue(of(aDue));
    vi.spyOn(PaymentsApiEndpoint.prototype, 'register').mockReturnValue(
      throwError(() => new Error('POST: regla de negocio no cumplida')),
    );

    const store = TestBed.inject(BillingStore);
    store.loadPaymentDue(10, [1]);
    store.registerPayment(10, [1]);

    expect(store.payments()).toEqual([]);
    expect(store.due()).toEqual(aDue);
    expect(store.error()).toContain('regla de negocio no cumplida');
  });
});

describe('PaymentsApiEndpoint - US-05: el cliente NUNCA envia monto', () => {
  it('register() hace POST con body que solo contiene installmentIds', () => {
    let captured: HttpRequest<unknown> | null = null;
    const http: HttpClient = {
      post: (url: string, body: unknown) => {
        captured = { url, body } as unknown as HttpRequest<unknown>;
        return of({ id: 1, allocations: [] }) as unknown as Observable<unknown>;
      },
    } as unknown as HttpClient;
    const ep = new PaymentsApiEndpoint(http);

    ep.register(10, [1, 2, 3]).subscribe();

    const body = (captured as unknown as { body: Record<string, unknown> }).body;
    const url  = (captured as unknown as { url: string }).url;
    expect(url).toBe(`${environment.apiBaseUrl}/api/v1/credit-profiles/10/payments`);
    expect(body).toEqual({ installmentIds: [1, 2, 3] });
    expect(body).not.toHaveProperty('amount');
    expect(body).not.toHaveProperty('monto');
    expect(body).not.toHaveProperty('total');
  });
});

describe('BillingStore - pendiente #4: triggers del scheduler', () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BillingStore,
        { provide: HttpClient, useValue: anHttp },
      ],
    });
  });

  it('runOverdueSweep() publica mensaje de exito y libera el lock de job', async () => {
    const { BillingJobsApiEndpoint } = await import('../infrastructure/billing-jobs-api-endpoint');
    vi.spyOn(BillingJobsApiEndpoint.prototype, 'runOverdueSweep').mockReturnValue(of(void 0));

    const store = TestBed.inject(BillingStore);
    store.runOverdueSweep('2026-11-23');

    expect(store.jobRunning()).toBeNull();
    expect(store.jobMessage()).toContain('Barrido');
  });

  it('runAccountStatements() propaga error del backend al signal error', async () => {
    const { BillingJobsApiEndpoint } = await import('../infrastructure/billing-jobs-api-endpoint');
    vi.spyOn(BillingJobsApiEndpoint.prototype, 'runAccountStatements').mockReturnValue(
      throwError(() => new Error('POST: sin permiso')),
    );

    const store = TestBed.inject(BillingStore);
    store.runAccountStatements();

    expect(store.jobRunning()).toBeNull();
    expect(store.error()).toContain('sin permiso');
  });

  it('runOverdueSweep() pasa asOf tal cual al endpoint; sin asOf, pasa undefined', async () => {
    const { BillingJobsApiEndpoint } = await import('../infrastructure/billing-jobs-api-endpoint');
    const spy = vi.spyOn(BillingJobsApiEndpoint.prototype, 'runOverdueSweep').mockReturnValue(of(void 0));
    const store = TestBed.inject(BillingStore);

    store.runOverdueSweep('2026-11-01');
    store.runOverdueSweep();

    expect(spy).toHaveBeenNthCalledWith(1, '2026-11-01');
    expect(spy).toHaveBeenNthCalledWith(2, undefined);
  });
});
