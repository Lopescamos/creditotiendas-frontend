import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthStore } from '../../../../iam/application/auth.store';
import { CreditManagementStore } from '../../../application/credit-management.store';

@Component({
  selector: 'app-purchase-requests-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatMenuModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './purchase-requests-inbox.component.html',
})
export class PurchaseRequestsInboxComponent implements OnInit {
  private auth = inject(AuthStore);
  protected credit = inject(CreditManagementStore);
  protected statusFilter = signal<string>('PENDING');

  ngOnInit() { this.load(); }
  onFilterChange(s: string) { this.statusFilter.set(s); this.load(); }
  private load() {
    const storeId = this.auth.activeStoreId();
    if (storeId) this.credit.loadRequestsByStore(storeId, this.statusFilter() || undefined);
  }
  approve(id: number) {
    if (confirm('Al aprobar se generará automáticamente la venta a crédito con las condiciones vigentes del perfil. ¿Continuar?')) {
      this.credit.approveRequest(id);
    }
  }
  reject(id: number) {
    const reason = window.prompt('Motivo del rechazo (obligatorio):') ?? '';
    if (reason.trim()) this.credit.rejectRequest(id, reason.trim());
  }
}
