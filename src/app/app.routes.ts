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
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./credit-management/presentation/views/store-dashboard/store-dashboard.component').then(
                (m) => m.StoreDashboardComponent,
              ),
          },
          {
            path: 'credit-profiles',
            loadComponent: () =>
              import('./credit-management/presentation/views/credit-profiles-list/credit-profiles-list.component').then(
                (m) => m.CreditProfilesListComponent,
              ),
          },
          {
            path: 'credit-profiles/new',
            loadComponent: () =>
              import('./credit-management/presentation/views/credit-profile-form/credit-profile-form.component').then(
                (m) => m.CreditProfileFormComponent,
              ),
          },
          {
            path: 'credit-profiles/:id/edit',
            loadComponent: () =>
              import('./credit-management/presentation/views/credit-profile-form/credit-profile-form.component').then(
                (m) => m.CreditProfileFormComponent,
              ),
          },
          {
            path: 'credit-sales',
            loadComponent: () =>
              import('./credit-management/presentation/views/credit-sales-list/credit-sales-list.component').then(
                (m) => m.CreditSalesListComponent,
              ),
          },
          {
            path: 'credit-sales/new',
            loadComponent: () =>
              import('./credit-management/presentation/views/credit-sale-wizard/credit-sale-wizard.component').then(
                (m) => m.CreditSaleWizardComponent,
              ),
          },
          {
            path: 'credit-sales/:id',
            loadComponent: () =>
              import('./credit-management/presentation/views/credit-sale-detail/credit-sale-detail.component').then(
                (m) => m.CreditSaleDetailComponent,
              ),
          },
          {
            path: 'purchase-requests',
            loadComponent: () =>
              import('./credit-management/presentation/views/purchase-requests-inbox/purchase-requests-inbox.component').then(
                (m) => m.PurchaseRequestsInboxComponent,
              ),
          },
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
          {
            path: 'payments',
            loadComponent: () =>
              import('./billing/presentation/views/installments-due/installments-due.component').then(
                (m) => m.InstallmentsDueComponent,
              ),
          },
          {
            path: 'payments/register',
            loadComponent: () =>
              import('./billing/presentation/views/register-payment/register-payment.component').then(
                (m) => m.RegisterPaymentComponent,
              ),
          },
          {
            path: 'account-statements',
            loadComponent: () =>
              import('./billing/presentation/views/account-statements-list/account-statements-list.component').then(
                (m) => m.AccountStatementsListComponent,
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
          {
            path: 'billing-jobs',
            loadComponent: () =>
              import('./billing/presentation/views/billing-jobs/billing-jobs.component').then(
                (m) => m.BillingJobsComponent,
              ),
          },
          {
            path: 'operation-logs',
            loadComponent: () =>
              import('./audit/presentation/views/operation-logs/operation-logs.component').then(
                (m) => m.OperationLogsComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
