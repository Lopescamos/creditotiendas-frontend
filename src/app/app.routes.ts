import { Routes } from '@angular/router';
import { authGuard } from './shared/presentation/guards/auth.guard';
import { roleGuard } from './shared/presentation/guards/role.guard';
import { UserRole } from './shared/domain/model/user-role.enum';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./iam/presentation/views/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/presentation/layouts/app-shell/app-shell.component').then(
        (m) => m.AppShellComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'system/users' },

      // ========== SYSTEM_ADMIN (plataforma) ==========
      {
        path: 'system',
        canActivate: [roleGuard([UserRole.SystemAdmin])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'users' },
          {
            path: 'users',
            loadComponent: () =>
              import('./iam/presentation/views/users-list/users-list.component').then(
                (m) => m.UsersListComponent,
              ),
          },
          {
            path: 'users/new',
            loadComponent: () =>
              import('./iam/presentation/views/user-form/user-form.component').then(
                (m) => m.UserFormComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
