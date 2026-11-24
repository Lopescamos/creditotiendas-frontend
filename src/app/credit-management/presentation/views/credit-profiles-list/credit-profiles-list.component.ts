import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../../../iam/application/auth.store';
import { CreditManagementStore } from '../../../application/credit-management.store';

@Component({
  selector: 'app-credit-profiles-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './credit-profiles-list.component.html',
})
export class CreditProfilesListComponent implements OnInit {
  private auth = inject(AuthStore);
  protected store = inject(CreditManagementStore);

  ngOnInit() { const s = this.auth.activeStoreId(); if (s) this.store.loadProfilesByStore(s); }
  usage(p: { creditLimit: number; availableCredit: number }): number {
    return p.creditLimit <= 0 ? 0 : Math.round(((p.creditLimit - p.availableCredit) / p.creditLimit) * 100);
  }
}
