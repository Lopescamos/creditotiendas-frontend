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
import { StoreManagementStore } from '../../../application/store-management.store';
import { Product, ProductType } from '../../../domain/model/product.entity';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthStore);
  protected store = inject(StoreManagementStore);

  protected editing = false;
  protected editingId: number | null = null;
  protected selectedFile: File | null = null;

  readonly types = Object.values(ProductType);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    type: [ProductType.PRODUCT as string, Validators.required],
    supplier: [''],
    brand: [''],
    measurementUnitId: [null as number | null],
    cashPrice: [0, [Validators.required, Validators.min(0.01)]],
    creditPrice: [0, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit() {
    this.store.loadCatalogs();
    const storeId = this.auth.activeStoreId();
    if (storeId && this.store.products().length === 0) this.store.loadProductsByStore(storeId);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.editingId = Number(id);
      const p = this.store.products().find((x) => x.id === this.editingId);
      if (p) this.form.patchValue(p);
    }
  }

  onFileSelected(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile = f;
  }

  save() {
    if (this.form.invalid) return;
    const storeId = this.auth.activeStoreId();
    if (!storeId) return;
    const v = this.form.getRawValue();
    const p = new Product(this.editingId ?? 0, storeId, v.name, v.description,
      v.type as ProductType, v.supplier, v.brand, v.measurementUnitId,
      v.cashPrice, v.creditPrice, null, true);
    if (this.editing) this.store.updateProduct(p); else this.store.createProduct(storeId, p);
    if (this.selectedFile && this.editingId) this.store.uploadImage(this.editingId, this.selectedFile);
    this.router.navigate(['/app/store/products']);
  }
}
