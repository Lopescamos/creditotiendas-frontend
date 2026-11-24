import { HttpInterceptorFn } from '@angular/common/http';
import { AUTH_TOKEN_KEY } from './auth-storage';
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  if (!token || req.headers.has('Authorization')) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
