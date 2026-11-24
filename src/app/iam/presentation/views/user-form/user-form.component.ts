import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IamStore } from '../../../application/iam.store';
import { StoreManagementStore } from '../../../../store-management/application/store-management.store';
import { UserRole } from '../../../../shared/domain/model/user-role.enum';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected iam = inject(IamStore);
  protected storeMgmt = inject(StoreManagementStore);

  readonly roleOptions = [
    { v: UserRole.StoreAdmin, l: 'Admin de tienda' },
    { v: UserRole.Client,     l: 'Cliente' },
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    role:      [UserRole.StoreAdmin as string, Validators.required],
    storeId:   [null as number | null],
  });

  ngOnInit() { this.storeMgmt.loadStores(); }

  isStoreAdmin(): boolean { return this.form.controls.role.value === UserRole.StoreAdmin; }

  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const storeIds = this.isStoreAdmin() && v.storeId ? [v.storeId] : [];
    this.iam.create({
      email: v.email, password: v.password,
      firstName: v.firstName, lastName: v.lastName,
      role: v.role, storeIds,
    });
    this.router.navigate(['/app/system/users']);
  }
}
