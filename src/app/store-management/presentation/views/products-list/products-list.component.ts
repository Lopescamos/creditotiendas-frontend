import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthStore } from '../../../../iam/application/auth.store';
import { StoreManagementStore } from '../../../application/store-management.store';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  private auth = inject(AuthStore);
  protected store = inject(StoreManagementStore);
  ngOnInit() {
    const s = this.auth.activeStoreId();
    if (s) { this.store.loadProductsByStore(s); this.store.loadCatalogs(); }
  }
  toggle(id: number, active: boolean) { this.store.toggleProductStatus(id, active); }
}
