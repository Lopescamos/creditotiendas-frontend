import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthStore } from '../../../../iam/application/auth.store';
import { CreditManagementStore } from '../../../application/credit-management.store';

@Component({
  selector: 'app-credit-sales-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './credit-sales-list.component.html',
})
export class CreditSalesListComponent implements OnInit {
  private auth = inject(AuthStore);
  protected credit = inject(CreditManagementStore);
  protected selectedProfileId = signal<number | null>(null);

  ngOnInit() { const s = this.auth.activeStoreId(); if (s) this.credit.loadProfilesByStore(s); }

  onProfileChange(id: number) {
    this.selectedProfileId.set(id);
    if (id) this.credit.loadSalesByProfile(id);
  }
}
