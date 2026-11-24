import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError, lastValueFrom, Observable } from 'rxjs';
import { vi } from 'vitest';
import { AuthenticationApi } from './authentication-api';
import { UserRole } from '../../shared/domain/model/user-role.enum';

function provideHttp(response: unknown): { spy: { url: string; body: unknown }; api: AuthenticationApi } {
  const spy = { url: '', body: null as unknown };
  const http = {
    post: (url: string, body: unknown): Observable<unknown> => {
      spy.url = url;
      spy.body = body;
      if (response instanceof Error) {
        return throwError(() => ({ error: { message: response.message || 'Unauthorized' } }));
      }
      return of(response);
    },
  } as unknown as HttpClient;
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [AuthenticationApi, { provide: HttpClient, useValue: http }],
  });
  return { spy, api: TestBed.inject(AuthenticationApi) };
}

describe('AuthenticationApi.signIn - fallback de fullName (fix ??/||)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('mapea fullName del backend al AuthenticatedUser', async () => {
    const { api } = provideHttp({
      id: 1, email: 'a@b.c', fullName: 'Juana Perez',
      role: UserRole.StoreAdmin, token: 'tk', storeIds: [5],
    });

    const u = await lastValueFrom(api.signIn('a@b.c', 'pw'));
    expect(u.fullName).toBe('Juana Perez');
    expect(u.role).toBe(UserRole.StoreAdmin);
    expect(u.storeIds).toEqual([5]);
  });

  it('sin fullName, concatena firstName + lastName', async () => {
    const { api } = provideHttp({
      id: 1, email: 'a@b.c', firstName: 'Juana', lastName: 'Perez',
      role: UserRole.StoreAdmin, token: 'tk',
    });
    const u = await lastValueFrom(api.signIn('a@b.c', 'pw'));
    expect(u.fullName).toBe('Juana Perez');
  });

  it('sin fullName/firstName/lastName, el fallback es el email (bug previo: parseo de ??/||)', async () => {
    const { api } = provideHttp({
      id: 1, email: 'ana@b.c',
      role: UserRole.StoreAdmin, token: 'tk',
    });
    const u = await lastValueFrom(api.signIn('ana@b.c', 'pw'));
    expect(u.fullName).toBe('ana@b.c');
  });

  it('cuando storeIds no viene, usa []', async () => {
    const { api } = provideHttp({
      id: 1, email: 'a@b.c', fullName: 'X',
      role: UserRole.SystemAdmin, token: 'tk',
    });
    const u = await lastValueFrom(api.signIn('a@b.c', 'pw'));
    expect(u.storeIds).toEqual([]);
  });

  it('en error 401, propaga como Error', async () => {
    const { api } = provideHttp(new Error('Password incorrecto'));
    await expect(lastValueFrom(api.signIn('a@b.c', 'pw'))).rejects.toThrow(/Password incorrecto/);
  });
});
