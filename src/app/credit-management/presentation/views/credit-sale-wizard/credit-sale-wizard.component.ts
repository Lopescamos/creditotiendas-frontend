import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { AuthStore } from '../../../../iam/application/auth.store';
import { CreditManagementStore } from '../../../application/credit-management.store';
import { StoreManagementStore } from '../../../../store-management/application/store-management.store';
import { SaleLineItem } from '../../../domain/model/line-item.entity';
import { SaleModality } from '../../../domain/model/credit-sale.entity';

interface Row { productId: number; quantity: number; }

@Component({
  selector: 'app-credit-sale-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatRadioModule],
  templateUrl: './credit-sale-wizard.component.html',
})
export class CreditSaleWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthStore);
  protected credit = inject(CreditManagementStore);
  protected storeMgmt = inject(StoreManagementStore);

  protected rows = signal<Row[]>([{ productId: 0, quantity: 1 }]);

  readonly form = this.fb.nonNullable.group({
    creditProfileId: [0, Validators.required],
    modality: [SaleModality.INSTALLMENTS as string, Validators.required],
    installmentCount: [6, [Validators.required, Validators.min(1), Validators.max(60)]],
    graceDays: [0, [Validators.required, Validators.min(0), Validators.max(365)]],
  });

  readonly selectedProfile = computed(() =>
    this.credit.profiles().find((p) => p.id === this.form.controls.creditProfileId.value) ?? null);

  readonly total = computed(() =>
    this.rows().reduce((s, r) => s + this.unitPrice(r.productId) * r.quantity, 0));

  readonly withinLimit = computed(() => {
    const profile = this.selectedProfile();
    return profile ? this.total() <= profile.availableCredit : true;
  });

  ngOnInit() {
    const s = this.auth.activeStoreId();
    if (s) {
      this.credit.loadProfilesByStore(s);
      this.storeMgmt.loadProductsByStore(s);
    }
    this.credit.clearSimulation();
  }

  unitPrice(productId: number): number {
    return this.storeMgmt.products().find((p) => p.id === productId)?.creditPrice ?? 0;
  }
  subtotal(row: Row): number { return this.unitPrice(row.productId) * row.quantity; }

  addRow() { this.rows.update((rs) => [...rs, { productId: 0, quantity: 1 }]); }
  removeRow(i: number) { this.rows.update((rs) => rs.filter((_, idx) => idx !== i)); }
  updateRow(i: number, patch: Partial<Row>) {
    this.rows.update((rs) => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  onModalityChange(v: string) {
    if (v === SaleModality.SINGLE_PAYMENT) this.form.controls.installmentCount.setValue(1);
  }

  private buildPayload() {
    const v = this.form.getRawValue();
    const items: SaleLineItem[] = this.rows()
      .filter((r) => r.productId > 0 && r.quantity > 0)
      .map((r) => {
        const p = this.storeMgmt.products().find((x) => x.id === r.productId);
        return { productId: r.productId, productName: p?.name, quantity: r.quantity, unitPrice: p?.creditPrice ?? 0 };
      });
    return { items, installmentCount: v.installmentCount, graceDays: v.graceDays, modality: v.modality };
  }

  simulate() {
    if (this.form.invalid || !this.withinLimit()) return;
    const v = this.form.getRawValue();
    this.credit.simulate(v.creditProfileId, this.buildPayload());
  }

  save() {
    if (this.form.invalid || !this.withinLimit()) return;
    const v = this.form.getRawValue();
    this.credit.register(v.creditProfileId, this.buildPayload());
    this.router.navigate(['/app/store/credit-sales']);
  }
}
