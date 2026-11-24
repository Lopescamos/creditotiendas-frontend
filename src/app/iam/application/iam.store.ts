import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../domain/model/user.entity';
import { Role } from '../domain/model/role.entity';
import { UsersApiEndpoint } from '../infrastructure/users-api-endpoint';
import { RolesApiEndpoint } from '../infrastructure/roles-api-endpoint';

@Injectable({ providedIn: 'root' })
export class IamStore {
  private http = inject(HttpClient);
  private usersEp = new UsersApiEndpoint(this.http);
  private rolesEp = new RolesApiEndpoint(this.http);

  private usersSignal = signal<User[]>([]);
  private rolesSignal = signal<Role[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly users = this.usersSignal.asReadonly();
  readonly roles = this.rolesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadUsers() {
    this.loadingSignal.set(true);
    this.usersEp.getAll().subscribe({
      next: (u) => { this.usersSignal.set(u); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  loadRoles() {
    this.rolesEp.getAll().subscribe({
      next: (r) => this.rolesSignal.set(r),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  create(data: { email:string; password:string; firstName:string; lastName:string; role:string; storeIds?:number[]; }) {
    this.loadingSignal.set(true);
    this.usersEp.createWithPassword(data).subscribe({
      next: (u) => { this.usersSignal.update((xs) => [...xs, u]); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  toggleStatus(id: number, active: boolean) {
    this.usersEp.updateStatus(id, active).subscribe({
      next: (u) => this.usersSignal.update((xs) => xs.map((x) => x.id === u.id ? u : x)),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  assignStore(userId: number, storeId: number) {
    this.usersEp.assignStore(userId, storeId).subscribe({
      next: (u) => this.usersSignal.update((xs) => xs.map((x) => x.id === u.id ? u : x)),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
}
