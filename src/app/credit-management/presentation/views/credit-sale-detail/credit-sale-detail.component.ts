import { Component, inject, OnInit, OnDestroy, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CreditManagementStore } from '../../../application/credit-management.store';
import { BillingStore } from '../../../../billing/application/billing.store';

/**
 * US-07 (panel web) — Pendiente #2 completado.
 * Muestra el cronograma de una venta a credito. Combina:
 *  - PaymentPlan (snapshot del cronograma, lo que se congelo al registrar)
 *  - Installments reales de billing (estado actual: PENDIENTE/PAGADA/VENCIDA)
 */
@Component({
  selector: 'app-credit-sale-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './credit-sale-detail.component.html',
})
export class CreditSaleDetailComponent implements OnInit, OnDestroy {
  @Input() id!: string;  // llega via withComponentInputBinding() desde /app/store/credit-sales/:id

  protected credit = inject(CreditManagementStore);
  protected billing = inject(BillingStore);

  /** Fusiona el schedule planeado con el estado real de las cuotas (match por numero). */
  protected rows = computed(() => {
    const plan = this.credit.selectedSalePlan();
    const real = this.billing.saleInstallments();
    if (!plan) return [];
    return plan.schedule.map((sch) => {
      const realCuota = real.find((i) => i.installmentNumber === sch.number);
      return {
        number: sch.number,
        dueDate: sch.dueDate,
        principal: sch.principal,
        interest: sch.interest,
        installment: sch.installment,
        remainingBalance: sch.remainingBalance,
        status: realCuota?.status ?? null,
        paidAt: realCuota?.paidAt ?? null,
      };
    });
  });

  ngOnInit() {
    const saleId = Number(this.id);
    if (!saleId) return;
    this.credit.loadSale(saleId);
    this.credit.loadPaymentPlan(saleId);
    this.billing.loadInstallmentsBySale(saleId);
  }
  ngOnDestroy() { this.credit.clearSelectedSale(); }
}
