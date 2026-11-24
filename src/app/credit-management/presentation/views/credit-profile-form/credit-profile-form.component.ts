import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../../iam/application/auth.store';
import { CreditManagementStore } from '../../../application/credit-management.store';
import { StoreManagementStore } from '../../../../store-management/application/store-management.store';
import { CreditProfile, CreditProfileStatus, InterestRateType, CapitalizationPeriod } from '../../../domain/model/credit-profile.entity';

@Component({
  selector: 'app-credit-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './credit-profile-form.component.html',
})
export class CreditProfileFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthStore);
  protected credit = inject(CreditManagementStore);
  protected storeMgmt = inject(StoreManagementStore);

  protected editing = false;
  protected editingId: number | null = null;

  readonly rateTypes = Object.values(InterestRateType);
  readonly capPeriods = Object.values(CapitalizationPeriod);
  readonly statuses = Object.values(CreditProfileStatus);

  readonly form = this.fb.nonNullable.group({
    clientUserId: [0, [Validators.required, Validators.min(1)]],
    clientFullName: ['', Validators.required],
    clientDocument: ['', [Validators.required, Validators.pattern(/^\d{8,20}$/)]],
    currencyId: [1, Validators.required],
    creditLimit: [0, [Validators.required, Validators.min(0.01)]],
    interestRate: [45, [Validators.required, Validators.min(0), Validators.max(999)]],
    interestRateType: [InterestRateType.NOMINAL as string, Validators.required],
    capitalizationPeriod: [CapitalizationPeriod.MONTHLY as string | null],
    lateInterestRate: [36, [Validators.required, Validators.min(0), Validators.max(999)]],
    lateInterestRateType: [InterestRateType.NOMINAL as string, Validators.required],
    maxTermDays: [180, [Validators.required, Validators.min(1), Validators.max(3650)]],
    cutoffDay: [1, [Validators.required, Validators.min(1), Validators.max(28)]],
    paymentDay: [15, [Validators.required, Validators.min(1), Validators.max(28)]],
    status: [CreditProfileStatus.ACTIVE as string],
  });

  ngOnInit() {
    this.storeMgmt.loadCatalogs();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.editingId = Number(id);
      const storeId = this.auth.activeStoreId();
      if (storeId && this.credit.profiles().length === 0) this.credit.loadProfilesByStore(storeId);
      const p = this.credit.profiles().find((x) => x.id === this.editingId);
      if (p) this.form.patchValue(p);
    }
  }

  save() {
    if (this.form.invalid) return;
    const storeId = this.auth.activeStoreId();
    if (!storeId) return;
    const v = this.form.getRawValue();
    const available = this.editing ? (this.credit.profiles().find((x) => x.id === this.editingId)?.availableCredit ?? v.creditLimit) : v.creditLimit;
    const p = new CreditProfile(
      this.editingId ?? 0, storeId, v.clientUserId,
      v.clientFullName, v.clientDocument, v.currencyId,
      v.creditLimit, available,
      v.interestRate, v.interestRateType as InterestRateType,
      (v.capitalizationPeriod as CapitalizationPeriod | null) ?? null,
      v.lateInterestRate, v.lateInterestRateType as InterestRateType,
      v.maxTermDays, v.cutoffDay, v.paymentDay,
      v.status as CreditProfileStatus,
    );
    if (this.editing) this.credit.updateProfile(p);
    else this.credit.createProfile(storeId, p);
    this.router.navigate(['/app/store/credit-profiles']);
  }
}
