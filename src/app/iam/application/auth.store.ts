import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationApi } from '../infrastructure/authentication-api';
import { AuthenticatedUser } from '../domain/model/authenticated-user.entity';
import { ACTIVE_STORE_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../infrastructure/auth-storage';
import { UserRole } from '../../shared/domain/model/user-role.enum';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private api = inject(AuthenticationApi);
  private router = inject(Router);

  private userSignal = signal<AuthenticatedUser | null>(this.hydrate());
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  // Pendiente #1 — selector multi-tienda: la tienda activa es independiente
  // del orden en que viene storeIds[]; se persiste para sobrevivir recargas.
  private activeStoreIdSignal = signal<number | null>(this.hydrateActiveStore(this.userSignal()));

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isSystemAdmin = computed(() => this.userSignal()?.role === UserRole.SystemAdmin);
  readonly isStoreAdmin = computed(() => this.userSignal()?.role === UserRole.StoreAdmin);
  readonly activeStoreId = this.activeStoreIdSignal.asReadonly();
  readonly availableStoreIds = computed(() => this.userSignal()?.storeIds ?? []);
  readonly hasMultipleStores = computed(() => this.availableStoreIds().length > 1);

  signIn(email: string, password: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.signIn(email, password).subscribe({
      next: (u) => {
        this.userSignal.set(u);
        localStorage.setItem(AUTH_TOKEN_KEY, u.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
        this.activeStoreIdSignal.set(u.storeIds[0] ?? null);
        if (u.storeIds[0] != null) localStorage.setItem(ACTIVE_STORE_KEY, String(u.storeIds[0]));
        this.loadingSignal.set(false);
        this.router.navigate([this.landingFor(u.role)]);
      },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }

  signOut(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(ACTIVE_STORE_KEY);
    this.userSignal.set(null);
    this.activeStoreIdSignal.set(null);
    this.router.navigate(['/login']);
  }

  /** Cambia la tienda activa para un STORE_ADMIN vinculado a varias. */
  setActiveStore(storeId: number): void {
    if (!this.availableStoreIds().includes(storeId)) return;
    this.activeStoreIdSignal.set(storeId);
    localStorage.setItem(ACTIVE_STORE_KEY, String(storeId));
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

  private hydrateActiveStore(user: AuthenticatedUser | null): number | null {
    if (!user) return null;
    if (typeof window === 'undefined') return user.storeIds[0] ?? null;
    const saved = localStorage.getItem(ACTIVE_STORE_KEY);
    const n = saved != null ? Number(saved) : NaN;
    // Si el guardado ya no esta entre las tiendas vinculadas, cae al primero.
    if (!Number.isNaN(n) && user.storeIds.includes(n)) return n;
    return user.storeIds[0] ?? null;
  }
}
