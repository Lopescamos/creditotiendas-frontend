import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationApi } from '../infrastructure/authentication-api';
import { AuthenticatedUser } from '../domain/model/authenticated-user.entity';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../infrastructure/auth-storage';
import { UserRole } from '../../shared/domain/model/user-role.enum';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private api = inject(AuthenticationApi);
  private router = inject(Router);

  private userSignal = signal<AuthenticatedUser | null>(this.hydrate());
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isSystemAdmin = computed(() => this.userSignal()?.role === UserRole.SystemAdmin);
  readonly isStoreAdmin = computed(() => this.userSignal()?.role === UserRole.StoreAdmin);
  readonly activeStoreId = computed(() => this.userSignal()?.storeIds[0] ?? null);

  signIn(email: string, password: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.signIn(email, password).subscribe({
      next: (u) => {
        this.userSignal.set(u);
        localStorage.setItem(AUTH_TOKEN_KEY, u.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
        this.loadingSignal.set(false);
        this.router.navigate([this.landingFor(u.role)]);
      },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }

  signOut(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  landingFor(role: string): string {
    if (role === UserRole.SystemAdmin) return '/app/system/stores';
    if (role === UserRole.StoreAdmin)  return '/app/store/dashboard';
    return '/login';
  }

  private hydrate(): AuthenticatedUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      const p = JSON.parse(raw);
      return new AuthenticatedUser(p.id, p.email, p.fullName, p.role, p.token, p.storeIds ?? []);
    } catch { return null; }
  }
}
