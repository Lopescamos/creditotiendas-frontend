import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreditProfile } from '../domain/model/credit-profile.entity';
import { CreditSale } from '../domain/model/credit-sale.entity';
import { PaymentPlan } from '../domain/model/payment-plan.entity';
import { PurchaseRequest } from '../domain/model/purchase-request.entity';
import { CreditProfilesApiEndpoint } from '../infrastructure/credit-profiles-api-endpoint';
import { CreditSalesApiEndpoint, RegisterCreditSalePayload } from '../infrastructure/credit-sales-api-endpoint';
import { PurchaseRequestsApiEndpoint } from '../infrastructure/purchase-requests-api-endpoint';

@Injectable({ providedIn: 'root' })
export class CreditManagementStore {
  private http = inject(HttpClient);
  private profilesEp = new CreditProfilesApiEndpoint(this.http);
  private salesEp = new CreditSalesApiEndpoint(this.http);
  private requestsEp = new PurchaseRequestsApiEndpoint(this.http);

  private profilesSignal = signal<CreditProfile[]>([]);
  private salesSignal = signal<CreditSale[]>([]);
  private requestsSignal = signal<PurchaseRequest[]>([]);
  private simulationSignal = signal<PaymentPlan | null>(null);
  private selectedSaleSignal = signal<CreditSale | null>(null);
  private selectedSalePlanSignal = signal<PaymentPlan | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly profiles = this.profilesSignal.asReadonly();
  readonly sales = this.salesSignal.asReadonly();
  readonly requests = this.requestsSignal.asReadonly();
  readonly simulation = this.simulationSignal.asReadonly();
  readonly selectedSale = this.selectedSaleSignal.asReadonly();
  readonly selectedSalePlan = this.selectedSalePlanSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadProfilesByStore(storeId: number) {
    this.loadingSignal.set(true);
    this.profilesEp.listByStore(storeId).subscribe({
      next: (p) => { this.profilesSignal.set(p); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  createProfile(storeId: number, p: CreditProfile) {
    this.profilesEp.create(storeId, p).subscribe({
      next: (x) => this.profilesSignal.update((xs) => [...xs, x]),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  updateProfile(p: CreditProfile) {
    this.profilesEp.update(p.id, p).subscribe({
      next: (x) => this.profilesSignal.update((xs) => xs.map((y) => y.id === x.id ? x : y)),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }

  loadSalesByProfile(creditProfileId: number) {
    this.loadingSignal.set(true);
    this.salesEp.listByProfile(creditProfileId).subscribe({
      next: (s) => { this.salesSignal.set(s); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  simulate(creditProfileId: number, payload: RegisterCreditSalePayload) {
    this.loadingSignal.set(true); this.errorSignal.set(null);
    this.salesEp.simulate(creditProfileId, payload).subscribe({
      next: (plan) => { this.simulationSignal.set(plan); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  register(creditProfileId: number, payload: RegisterCreditSalePayload) {
    this.loadingSignal.set(true);
    this.salesEp.register(creditProfileId, payload).subscribe({
      next: (s) => { this.salesSignal.update((xs) => [...xs, s]); this.loadingSignal.set(false); this.simulationSignal.set(null); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  clearSimulation() { this.simulationSignal.set(null); }

  // US-07 (panel web) — Pendiente #2: detalle de venta con cronograma real.
  loadSale(id: number) {
    this.loadingSignal.set(true);
    this.selectedSaleSignal.set(null);
    this.selectedSalePlanSignal.set(null);
    this.salesEp.get(id).subscribe({
      next: (s) => { this.selectedSaleSignal.set(s); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  loadPaymentPlan(id: number) {
    this.salesEp.paymentPlan(id).subscribe({
      next: (p) => this.selectedSalePlanSignal.set(p),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  clearSelectedSale() { this.selectedSaleSignal.set(null); this.selectedSalePlanSignal.set(null); }

  loadRequestsByStore(storeId: number, status?: string) {
    this.loadingSignal.set(true);
    this.requestsEp.listByStore(storeId, status).subscribe({
      next: (r) => { this.requestsSignal.set(r); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  approveRequest(id: number) {
    this.requestsEp.approve(id).subscribe({
      next: (r) => this.requestsSignal.update((xs) => xs.map((x) => x.id === r.id ? r : x)),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  rejectRequest(id: number, reason: string) {
    this.requestsEp.reject(id, reason).subscribe({
      next: (r) => this.requestsSignal.update((xs) => xs.map((x) => x.id === r.id ? r : x)),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
}
