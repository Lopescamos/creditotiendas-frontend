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
      { path: '', pathMatch: 'full', redirectTo: 'store/dashboard' },

      // ========== STORE_ADMIN (comercio) ==========
      {
        path: 'store',
        canActivate: [roleGuard([UserRole.StoreAdmin])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'products' },
          {
            path: 'products',
            loadComponent: () =>
              import('./store-management/presentation/views/products-list/products-list.component').then(
                (m) => m.ProductsListComponent,
              ),
          },
          {
            path: 'products/new',
            loadComponent: () =>
              import('./store-management/presentation/views/product-form/product-form.component').then(
                (m) => m.ProductFormComponent,
              ),
          },
          {
            path: 'products/:id/edit',
            loadComponent: () =>
              import('./store-management/presentation/views/product-form/product-form.component').then(
                (m) => m.ProductFormComponent,
              ),
          },
        ],
      },

      // ========== SYSTEM_ADMIN (plataforma) ==========
      {
        path: 'system',
        canActivate: [roleGuard([UserRole.SystemAdmin])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'stores' },
          {
            path: 'stores',
            loadComponent: () =>
              import('./store-management/presentation/views/stores-list/stores-list.component').then(
                (m) => m.StoresListComponent,
              ),
          },
          {
            path: 'stores/new',
            loadComponent: () =>
              import('./store-management/presentation/views/store-form/store-form.component').then(
                (m) => m.StoreFormComponent,
              ),
          },
          {
            path: 'stores/:id/edit',
            loadComponent: () =>
              import('./store-management/presentation/views/store-form/store-form.component').then(
                (m) => m.StoreFormComponent,
              ),
          },
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
