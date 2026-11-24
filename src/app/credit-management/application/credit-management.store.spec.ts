import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CreditManagementStore } from './credit-management.store';
import { CreditSalesApiEndpoint, RegisterCreditSalePayload } from '../infrastructure/credit-sales-api-endpoint';
import { PurchaseRequestsApiEndpoint } from '../infrastructure/purchase-requests-api-endpoint';
import { CreditSale, CreditSaleStatus, SaleModality } from '../domain/model/credit-sale.entity';
import { PaymentPlan } from '../domain/model/payment-plan.entity';
import { PurchaseRequest } from '../domain/model/purchase-request.entity';
import { InterestRateType } from '../domain/model/credit-profile.entity';

const anHttp = {} as HttpClient;

function aPlan(): PaymentPlan {
  return { totalAmount: 500, installments: [] } as unknown as PaymentPlan;
}

function aSale(id = 1): CreditSale {
  return new CreditSale(
    id, 10, 100, [], 500, 3, 0,
    SaleModality.INSTALLMENTS,
    0.03, InterestRateType.NOMINAL, null,
    0.05, InterestRateType.NOMINAL,
    null, CreditSaleStatus.ACTIVE, '2026-11-23',
  );
}

const payload: RegisterCreditSalePayload = {
  items: [{ productId: 1, quantity: 2 }] as unknown as RegisterCreditSalePayload['items'],
  installmentCount: 3,
  graceDays: 0,
  modality: SaleModality.INSTALLMENTS,
};

describe('CreditManagementStore - flujo de simulacion / registro', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CreditManagementStore,
        { provide: HttpClient, useValue: anHttp },
      ],
    });
  });

  it('simulate() guarda el PaymentPlan recibido y limpia el error', () => {
    const plan = aPlan();
    vi.spyOn(CreditSalesApiEndpoint.prototype, 'simulate').mockReturnValue(of(plan));

    const store = TestBed.inject(CreditManagementStore);
    store.simulate(10, payload);

    expect(store.simulation()).toEqual(plan);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('simulate() fallido NO setea simulation() y expone el error del backend', () => {
    vi.spyOn(CreditSalesApiEndpoint.prototype, 'simulate').mockReturnValue(
      throwError(() => new Error('POST: Monto excede el credito disponible')),
    );

    const store = TestBed.inject(CreditManagementStore);
    store.simulate(10, payload);

    expect(store.simulation()).toBeNull();
    expect(store.error()).toContain('Monto excede el credito disponible');
    expect(store.loading()).toBe(false);
  });

  it('register() exitoso agrega la venta y descarta la simulacion previa', () => {
    const plan = aPlan();
    const sale = aSale(99);
    vi.spyOn(CreditSalesApiEndpoint.prototype, 'simulate').mockReturnValue(of(plan));
    vi.spyOn(CreditSalesApiEndpoint.prototype, 'register').mockReturnValue(of(sale));

    const store = TestBed.inject(CreditManagementStore);
    store.simulate(10, payload);
    expect(store.simulation()).not.toBeNull();

    store.register(10, payload);

    expect(store.sales()).toEqual([sale]);
    expect(store.simulation()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('register() fallido NO agrega venta y mantiene la simulacion previa para reintentar', () => {
    const plan = aPlan();
    vi.spyOn(CreditSalesApiEndpoint.prototype, 'simulate').mockReturnValue(of(plan));
    vi.spyOn(CreditSalesApiEndpoint.prototype, 'register').mockReturnValue(
      throwError(() => new Error('POST: regla de negocio no cumplida')),
    );

    const store = TestBed.inject(CreditManagementStore);
    store.simulate(10, payload);
    store.register(10, payload);

    expect(store.sales()).toEqual([]);
    expect(store.simulation()).toEqual(plan);
    expect(store.error()).toContain('regla de negocio no cumplida');
  });

  it('clearSimulation() descarta el cronograma simulado', () => {
    vi.spyOn(CreditSalesApiEndpoint.prototype, 'simulate').mockReturnValue(of(aPlan()));
    const store = TestBed.inject(CreditManagementStore);
    store.simulate(10, payload);
    expect(store.simulation()).not.toBeNull();

    store.clearSimulation();
    expect(store.simulation()).toBeNull();
  });
});

describe('CreditManagementStore - solicitudes de compra', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CreditManagementStore,
        { provide: HttpClient, useValue: anHttp },
      ],
    });
  });

  function aRequest(id: number, status: string): PurchaseRequest {
    return { id, status } as unknown as PurchaseRequest;
  }

  it('approveRequest() reemplaza la solicitud por la devuelta por el backend', () => {
    const pending = aRequest(5, 'PENDING');
    const approved = aRequest(5, 'APPROVED');
    vi.spyOn(PurchaseRequestsApiEndpoint.prototype, 'listByStore').mockReturnValue(of([pending]));
    vi.spyOn(PurchaseRequestsApiEndpoint.prototype, 'approve').mockReturnValue(of(approved));

    const store = TestBed.inject(CreditManagementStore);
    store.loadRequestsByStore(100);
    store.approveRequest(5);

    expect(store.requests()[0].status).toBe('APPROVED');
  });

  it('rejectRequest() envia el motivo al endpoint', () => {
    const pending = aRequest(5, 'PENDING');
    const rejected = aRequest(5, 'REJECTED');
    vi.spyOn(PurchaseRequestsApiEndpoint.prototype, 'listByStore').mockReturnValue(of([pending]));
    const spy = vi.spyOn(PurchaseRequestsApiEndpoint.prototype, 'reject').mockReturnValue(of(rejected));

    const store = TestBed.inject(CreditManagementStore);
    store.loadRequestsByStore(100);
    store.rejectRequest(5, 'cliente sin elegibilidad');

    expect(spy).toHaveBeenCalledWith(5, 'cliente sin elegibilidad');
    expect(store.requests()[0].status).toBe('REJECTED');
  });
});
