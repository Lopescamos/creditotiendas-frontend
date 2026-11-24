import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../../iam/application/auth.store';
export const roleGuard = (allowed: string[]): CanActivateFn => () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const user = auth.user();
  if (!user) return router.createUrlTree(['/login']);
  if (!allowed.includes(user.role)) return router.createUrlTree([auth.landingFor(user.role)]);
  return true;
};
