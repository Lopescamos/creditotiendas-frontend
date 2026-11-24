import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../../../iam/application/auth.store';
import { CreditManagementStore } from '../../../application/credit-management.store';
import { BillingStore } from '../../../../billing/application/billing.store';
import { InstallmentStatus } from '../../../../billing/domain/model/installment.entity';

interface MonthBar { label: string; paid: number; pending: number; }

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './store-dashboard.component.html',
  styleUrl: './store-dashboard.component.css',
})
export class StoreDashboardComponent implements OnInit {
  private auth = inject(AuthStore);
  protected credit = inject(CreditManagementStore);
  protected billing = inject(BillingStore);

  readonly user = this.auth.user;
  readonly storeId = this.auth.activeStoreId;

  readonly totalByCollect = computed(() => this.billing.dueByStore()
    .filter((i) => i.status === InstallmentStatus.PENDING || i.status === InstallmentStatus.OVERDUE)
    .reduce((s, i) => s + i.installmentAmount, 0));

  readonly overdueAmount = computed(() => this.billing.dueByStore()
    .filter((i) => i.status === InstallmentStatus.OVERDUE)
    .reduce((s, i) => s + i.installmentAmount, 0));

  readonly overdueCount = computed(() => this.billing.dueByStore()
    .filter((i) => i.status === InstallmentStatus.OVERDUE).length);

  readonly accountsBreakdown = computed(() => {
    const items = this.billing.dueByStore();
    const totals = { onTrack: 0, dueSoon: 0, overdue: 0 };
    for (const i of items) {
      if (i.status === InstallmentStatus.OVERDUE) totals.overdue += i.installmentAmount;
      else if (this.daysUntil(i.dueDate) <= 7) totals.dueSoon += i.installmentAmount;
      else totals.onTrack += i.installmentAmount;
    }
    const total = totals.onTrack + totals.dueSoon + totals.overdue || 1;
    return [
      { key: 'Al día', dot: 'success', amount: totals.onTrack, pct: Math.round((totals.onTrack / total) * 100) },
      { key: 'Por vencer', dot: 'warning', amount: totals.dueSoon, pct: Math.round((totals.dueSoon / total) * 100) },
      { key: 'Vencidas', dot: 'danger', amount: totals.overdue, pct: Math.round((totals.overdue / total) * 100) },
    ];
  });

  // Barras de "Cobranza mensual" demo — en producción vendría de un endpoint de resumen.
  readonly months: MonthBar[] = [
    { label: 'Ene', paid: 60, pending: 20 },
    { label: 'Feb', paid: 90, pending: 30 },
    { label: 'Mar', paid: 110, pending: 40 },
    { label: 'Abr', paid: 85, pending: 25 },
    { label: 'May', paid: 140, pending: 60 },
    { label: 'Jun', paid: 130, pending: 55 },
    { label: 'Jul', paid: 160, pending: 70 },
    { label: 'Ago', paid: 120, pending: 45 },
    { label: 'Set', paid: 100, pending: 35 },
    { label: 'Oct', paid: 95, pending: 30 },
    { label: 'Nov', paid: 70, pending: 25 },
    { label: 'Dic', paid: 50, pending: 20 },
  ];

  readonly maxBar = computed(() => Math.max(...this.months.map((m) => m.paid + m.pending)));

  ngOnInit() {
    const s = this.storeId();
    if (s) {
      this.billing.loadDueByStore(s);
      this.credit.loadProfilesByStore(s);
    }
  }

  barHeight(value: number): number { return (value / this.maxBar()) * 160; }
  private daysUntil(dateIso: string): number {
    if (!dateIso) return 0;
    const d = new Date(dateIso).getTime() - Date.now();
    return Math.ceil(d / (1000 * 60 * 60 * 24));
  }
}
