import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StoreManagementStore } from '../../../application/store-management.store';

@Component({
  selector: 'app-stores-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './stores-list.component.html',
})
export class StoresListComponent implements OnInit {
  protected store = inject(StoreManagementStore);
  ngOnInit() { this.store.loadStores(); }
  toggle(id: number, active: boolean) { this.store.toggleStoreStatus(id, active); }
}
