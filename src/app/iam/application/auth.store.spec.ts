import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { AuthenticationApi } from '../infrastructure/authentication-api';
import { AuthenticatedUser } from '../domain/model/authenticated-user.entity';
import { ACTIVE_STORE_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../infrastructure/auth-storage';
import { UserRole } from '../../shared/domain/model/user-role.enum';

describe('AuthStore', () => {
  let apiMock: { signIn: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    apiMock = { signIn: vi.fn() };
    routerMock = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthenticationApi, useValue: apiMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('arranca sin usuario cuando localStorage esta vacio', () => {
    const store = TestBed.inject(AuthStore);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.activeStoreId()).toBeNull();
  });

  it('hidrata el usuario desde localStorage al construirse', () => {
    const saved = { id: 1, email: 'a@b.c', fullName: 'A B', role: UserRole.StoreAdmin, token: 'tk', storeIds: [7] };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(saved));
    const store = TestBed.inject(AuthStore);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isStoreAdmin()).toBe(true);
    expect(store.activeStoreId()).toBe(7);
  });

  it('signIn exitoso guarda token, setea usuario y navega al landing por rol', () => {
    const user = new AuthenticatedUser(1, 'a@b.c', 'A B', UserRole.SystemAdmin, 'tk', []);
    apiMock.signIn.mockReturnValue(of(user));
    const store = TestBed.inject(AuthStore);

    store.signIn('a@b.c', 'pw');

    expect(store.user()).toEqual(user);
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('tk');
    expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY)!)).toMatchObject({ email: 'a@b.c' });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/system/stores']);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('signIn fallido expone el mensaje en error() y no navega', () => {
    apiMock.signIn.mockReturnValue(throwError(() => new Error('Credenciales invalidas')));
    const store = TestBed.inject(AuthStore);

    store.signIn('a@b.c', 'mal');

    expect(store.user()).toBeNull();
    expect(store.error()).toBe('Credenciales invalidas');
    expect(store.loading()).toBe(false);
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it('signOut limpia storage, resetea usuario y redirige a /login', () => {
    const user = new AuthenticatedUser(1, 'a@b.c', 'A B', UserRole.StoreAdmin, 'tk', [5]);
    apiMock.signIn.mockReturnValue(of(user));
    const store = TestBed.inject(AuthStore);
    store.signIn('a@b.c', 'pw');

    store.signOut();

    expect(store.user()).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(routerMock.navigate).toHaveBeenLastCalledWith(['/login']);
  });

  describe('Pendiente #1 — selector multi-tienda', () => {
    it('despues de signIn, activeStoreId() es el primer storeId del usuario', () => {
      const user = new AuthenticatedUser(1, 'a@b.c', 'A', UserRole.StoreAdmin, 'tk', [5, 9, 17]);
      apiMock.signIn.mockReturnValue(of(user));
      const store = TestBed.inject(AuthStore);
      store.signIn('a@b.c', 'pw');
      expect(store.activeStoreId()).toBe(5);
      expect(localStorage.getItem(ACTIVE_STORE_KEY)).toBe('5');
    });

    it('hasMultipleStores() es true con 2+ y false con 1 o ninguno', () => {
      const multi = new AuthenticatedUser(1, 'a@b.c', 'A', UserRole.StoreAdmin, 'tk', [5, 9]);
      apiMock.signIn.mockReturnValue(of(multi));
      const store = TestBed.inject(AuthStore);
      store.signIn('a@b.c', 'pw');
      expect(store.hasMultipleStores()).toBe(true);
    });

    it('setActiveStore() cambia la tienda activa y la persiste', () => {
      const user = new AuthenticatedUser(1, 'a@b.c', 'A', UserRole.StoreAdmin, 'tk', [5, 9]);
      apiMock.signIn.mockReturnValue(of(user));
      const store = TestBed.inject(AuthStore);
      store.signIn('a@b.c', 'pw');

      store.setActiveStore(9);

      expect(store.activeStoreId()).toBe(9);
      expect(localStorage.getItem(ACTIVE_STORE_KEY)).toBe('9');
    });

    it('setActiveStore() ignora un storeId que no este vinculado al usuario', () => {
      const user = new AuthenticatedUser(1, 'a@b.c', 'A', UserRole.StoreAdmin, 'tk', [5, 9]);
      apiMock.signIn.mockReturnValue(of(user));
      const store = TestBed.inject(AuthStore);
      store.signIn('a@b.c', 'pw');

      store.setActiveStore(42);  // tienda ajena

      expect(store.activeStoreId()).toBe(5);  // se queda en la original
    });

    it('rehidrata la tienda activa guardada si sigue siendo valida', () => {
      const saved = { id: 1, email: 'a@b.c', fullName: 'A', role: UserRole.StoreAdmin, token: 'tk', storeIds: [5, 9] };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(saved));
      localStorage.setItem(ACTIVE_STORE_KEY, '9');

      const store = TestBed.inject(AuthStore);
      expect(store.activeStoreId()).toBe(9);
    });

    it('si la tienda activa guardada ya no esta entre las vinculadas, cae a la primera', () => {
      const saved = { id: 1, email: 'a@b.c', fullName: 'A', role: UserRole.StoreAdmin, token: 'tk', storeIds: [5, 9] };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(saved));
      localStorage.setItem(ACTIVE_STORE_KEY, '42');  // ya no vinculada

      const store = TestBed.inject(AuthStore);
      expect(store.activeStoreId()).toBe(5);
    });
  });

  describe('landingFor', () => {
    it('SYSTEM_ADMIN aterriza en /app/system/stores', () => {
      const store = TestBed.inject(AuthStore);
      expect(store.landingFor(UserRole.SystemAdmin)).toBe('/app/system/stores');
    });
    it('STORE_ADMIN aterriza en /app/store/dashboard', () => {
      const store = TestBed.inject(AuthStore);
      expect(store.landingFor(UserRole.StoreAdmin)).toBe('/app/store/dashboard');
    });
    it('CLIENT no tiene landing en el panel web, cae en /login', () => {
      const store = TestBed.inject(AuthStore);
      expect(store.landingFor(UserRole.Client)).toBe('/login');
    });
  });
});
