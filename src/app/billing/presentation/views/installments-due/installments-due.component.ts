import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthStore } from '../../../../iam/application/auth.store';
import { BillingStore } from '../../../application/billing.store';

@Component({
  selector: 'app-installments-due',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './installments-due.component.html',
})
export class InstallmentsDueComponent implements OnInit {
  private auth = inject(AuthStore);
  protected billing = inject(BillingStore);
  protected selected = signal<Set<number>>(new Set());

  readonly selectedByProfile = computed(() => {
    const map = new Map<number, number[]>();
    const items = this.billing.dueByStore();
    for (const id of this.selected()) {
      const i = items.find((x) => x.id === id);
      if (!i) continue;
      const arr = map.get(i.creditProfileId) ?? [];
      arr.push(id);
      map.set(i.creditProfileId, arr);
    }
    return map;
  });

  ngOnInit() { const s = this.auth.activeStoreId(); if (s) this.billing.loadDueByStore(s); }

  toggle(id: number, checked: boolean) {
    this.selected.update((s) => {
      const next = new Set(s);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }

  goRegister() {
    const byProfile = this.selectedByProfile();
    if (byProfile.size === 0) {
      alert('Selecciona al menos una cuota.');
      return;
    }
    if (byProfile.size > 1) {
      alert('Un pago cubre cuotas de UN solo cliente. Selecciona cuotas de un único perfil.');
      return;
    }
    const [[profileId, ids]] = byProfile.entries();
    const params = new URLSearchParams({ profileId: String(profileId), ids: ids.join(',') });
    window.location.href = `/app/store/payments/register?${params.toString()}`;
  }

  statusBadge(s: string) {
    if (s === 'PAID_ON_TIME') return 'ct-badge ct-badge--success';
    if (s === 'PAID_LATE') return 'ct-badge ct-badge--warning';
    if (s === 'OVERDUE') return 'ct-badge ct-badge--danger';
    return 'ct-badge ct-badge--warning';
  }
}
