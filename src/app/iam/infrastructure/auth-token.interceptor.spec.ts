import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { authTokenInterceptor } from './auth-token.interceptor';
import { AUTH_TOKEN_KEY } from './auth-storage';

function makeNext() {
  const spy = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200 })));
  const fn: HttpHandlerFn = (req) => spy(req);
  return { spy, fn };
}

describe('authTokenInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('agrega "Authorization: Bearer <token>" cuando hay token en storage', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'abc.def.ghi');
    const req = new HttpRequest('GET', '/api/v1/users');
    const { spy, fn } = makeNext();

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, fn));

    expect(spy).toHaveBeenCalledOnce();
    const outgoing = spy.mock.calls[0][0];
    expect(outgoing.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
  });

  it('no toca el header si no hay token en storage', () => {
    const req = new HttpRequest('GET', '/api/v1/users');
    const { spy, fn } = makeNext();

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, fn));

    const outgoing = spy.mock.calls[0][0];
    expect(outgoing.headers.has('Authorization')).toBe(false);
  });

  it('respeta el header Authorization si el caller ya lo seteo', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'otro');
    const req = new HttpRequest('GET', '/api/v1/public', {
      headers: new HttpRequest('GET', '/').headers.set('Authorization', 'Basic XYZ'),
    });
    const { spy, fn } = makeNext();

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, fn));

    const outgoing = spy.mock.calls[0][0];
    expect(outgoing.headers.get('Authorization')).toBe('Basic XYZ');
  });
});
