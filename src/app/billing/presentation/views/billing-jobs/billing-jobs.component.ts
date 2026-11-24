import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BillingStore } from '../../../application/billing.store';

/**
 * Pendiente #4 — triggers manuales del BillingScheduler (SYSTEM_ADMIN).
 * Pensado para demo/sustentacion: no es un flujo del usuario final.
 * Los endpoints responden 202 Accepted; el resultado se observa indirectamente
 * en installments (status OVERDUE) y en account-statements.
 */
@Component({
  selector: 'app-billing-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './billing-jobs.component.html',
})
export class BillingJobsComponent {
  protected billing = inject(BillingStore);
  protected asOf = signal<string>('');

  trigger(kind: 'overdue-sweep' | 'account-statements') {
    const d = this.asOf().trim() || undefined;
    if (kind === 'overdue-sweep') this.billing.runOverdueSweep(d);
    else this.billing.runAccountStatements(d);
  }
}
