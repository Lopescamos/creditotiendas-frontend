import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthStore } from '../../../../iam/application/auth.store';
import { BillingStore } from '../../../application/billing.store';
import { CreditManagementStore } from '../../../../credit-management/application/credit-management.store';

@Component({
  selector: 'app-account-statements-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './account-statements-list.component.html',
})
export class AccountStatementsListComponent implements OnInit {
  private auth = inject(AuthStore);
  protected billing = inject(BillingStore);
  protected credit = inject(CreditManagementStore);
  protected selected = signal<number | null>(null);

  ngOnInit() { const s = this.auth.activeStoreId(); if (s) this.credit.loadProfilesByStore(s); }

  onProfileChange(id: number) {
    this.selected.set(id);
    if (id) this.billing.loadStatementsByProfile(id);
  }
}
