import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StoreManagementStore } from '../../../application/store-management.store';
import { Store } from '../../../domain/model/store.entity';

@Component({
  selector: 'app-store-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './store-form.component.html',
})
export class StoreFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected store = inject(StoreManagementStore);

  protected editing = false;
  protected editingId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    razonSocial: ['', Validators.required],
    nombreComercial: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.editingId = Number(id);
      if (this.store.stores().length === 0) this.store.loadStores();
      const s = this.store.stores().find((x) => x.id === this.editingId);
      if (s) this.form.patchValue(s);
    }
  }
  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const s = new Store(this.editingId ?? 0, v.ruc, v.razonSocial, v.nombreComercial, v.direccion, v.telefono, true);
    if (this.editing) this.store.updateStore(s); else this.store.createStore(s);
    this.router.navigate(['/app/system/stores']);
  }
}
