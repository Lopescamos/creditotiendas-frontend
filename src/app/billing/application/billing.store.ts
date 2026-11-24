import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Installment } from '../domain/model/installment.entity';
import { Payment } from '../domain/model/payment.entity';
import { AccountStatement } from '../domain/model/account-statement.entity';
import { PaymentDue } from '../domain/model/payment-due.entity';
import { InstallmentsApiEndpoint } from '../infrastructure/installments-api-endpoint';
import { PaymentsApiEndpoint } from '../infrastructure/payments-api-endpoint';
import { AccountStatementsApiEndpoint } from '../infrastructure/account-statements-api-endpoint';
import { BillingJobsApiEndpoint } from '../infrastructure/billing-jobs-api-endpoint';

@Injectable({ providedIn: 'root' })
export class BillingStore {
  private http = inject(HttpClient);
  private installmentsEp = new InstallmentsApiEndpoint(this.http);
  private paymentsEp = new PaymentsApiEndpoint(this.http);
  private statementsEp = new AccountStatementsApiEndpoint(this.http);
  private jobsEp = new BillingJobsApiEndpoint(this.http);

  private dueByStoreSignal = signal<Installment[]>([]);
  private saleInstallmentsSignal = signal<Installment[]>([]);
  private paymentsSignal = signal<Payment[]>([]);
  private statementsSignal = signal<AccountStatement[]>([]);
  private dueSignal = signal<PaymentDue | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  // Pendiente #4 — triggers manuales del scheduler
  private jobRunningSignal = signal<'overdue-sweep' | 'account-statements' | null>(null);
  private jobMessageSignal = signal<string | null>(null);

  readonly dueByStore = this.dueByStoreSignal.asReadonly();
  readonly saleInstallments = this.saleInstallmentsSignal.asReadonly();
  readonly payments = this.paymentsSignal.asReadonly();
  readonly statements = this.statementsSignal.asReadonly();
  readonly due = this.dueSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly jobRunning = this.jobRunningSignal.asReadonly();
  readonly jobMessage = this.jobMessageSignal.asReadonly();

  loadDueByStore(storeId: number) {
    this.loadingSignal.set(true);
    this.installmentsEp.listDueByStore(storeId).subscribe({
      next: (i) => { this.dueByStoreSignal.set(i); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  loadInstallmentsBySale(saleId: number) {
    this.installmentsEp.listBySale(saleId).subscribe({
      next: (i) => this.saleInstallmentsSignal.set(i),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  loadPaymentDue(creditProfileId: number, installmentIds: number[]) {
    if (installmentIds.length === 0) { this.dueSignal.set(null); return; }
    this.installmentsEp.paymentDue(creditProfileId, installmentIds).subscribe({
      next: (d) => this.dueSignal.set(d),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  registerPayment(creditProfileId: number, installmentIds: number[]) {
    this.loadingSignal.set(true);
    this.paymentsEp.register(creditProfileId, installmentIds).subscribe({
      next: (p) => { this.paymentsSignal.update((xs) => [...xs, p]); this.loadingSignal.set(false); this.dueSignal.set(null); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  loadStatementsByProfile(creditProfileId: number) {
    this.loadingSignal.set(true);
    this.statementsEp.listByProfile(creditProfileId).subscribe({
      next: (s) => { this.statementsSignal.set(s); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  clearDue() { this.dueSignal.set(null); }

  // Pendiente #4 — triggers del scheduler (SYSTEM_ADMIN).
  runOverdueSweep(asOf?: string) {
    this.jobRunningSignal.set('overdue-sweep');
    this.jobMessageSignal.set(null);
    this.jobsEp.runOverdueSweep(asOf).subscribe({
      next: () => { this.jobRunningSignal.set(null); this.jobMessageSignal.set('Barrido de vencimientos encolado.'); },
      error: (e: Error) => { this.jobRunningSignal.set(null); this.errorSignal.set(e.message); },
    });
  }
  runAccountStatements(asOf?: string) {
    this.jobRunningSignal.set('account-statements');
    this.jobMessageSignal.set(null);
    this.jobsEp.runAccountStatements(asOf).subscribe({
      next: () => { this.jobRunningSignal.set(null); this.jobMessageSignal.set('Generacion de estados de cuenta encolada.'); },
      error: (e: Error) => { this.jobRunningSignal.set(null); this.errorSignal.set(e.message); },
    });
  }
  clearJobMessage() { this.jobMessageSignal.set(null); }
}
