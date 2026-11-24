import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { IamStore } from '../../../application/iam.store';
import { roleLabels } from '../../../../shared/domain/model/user-role.enum';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './users-list.component.html',
})
export class UsersListComponent implements OnInit {
  protected store = inject(IamStore);
  protected readonly roleLabels = roleLabels;
  ngOnInit() { this.store.loadUsers(); }
  toggle(id: number, active: boolean) { this.store.toggleStatus(id, active); }
  roleLabel(k: string) { return this.roleLabels[k] ?? k; }
}
