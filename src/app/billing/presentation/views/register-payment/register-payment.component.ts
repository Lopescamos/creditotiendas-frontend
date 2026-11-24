import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BillingStore } from '../../../application/billing.store';

@Component({
  selector: 'app-register-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './register-payment.component.html',
})
export class RegisterPaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected billing = inject(BillingStore);

  protected profileId = 0;
  protected installmentIds: number[] = [];

  readonly total = computed(() => this.billing.due()?.totalAmount ?? 0);

  ngOnInit() {
    const qp = this.route.snapshot.queryParamMap;
    this.profileId = Number(qp.get('profileId') ?? 0);
    this.installmentIds = (qp.get('ids') ?? '').split(',').filter(Boolean).map(Number);
    if (this.profileId && this.installmentIds.length) {
      this.billing.loadPaymentDue(this.profileId, this.installmentIds);
    }
  }

  confirm() {
    if (!this.profileId || this.installmentIds.length === 0) return;
    if (!confirm('No se permiten pagos parciales. El sistema aplicará la prelación mora → interés → capital. ¿Confirmar pago íntegro?')) return;
    this.billing.registerPayment(this.profileId, this.installmentIds);
    this.router.navigate(['/app/store/payments']);
  }
}
