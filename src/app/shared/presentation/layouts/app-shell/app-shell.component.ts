import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../../../../iam/application/auth.store';
import { UserRole } from '../../../domain/model/user-role.enum';

interface NavItem { label: string; initial: string; route: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  private auth = inject(AuthStore);
  readonly user = this.auth.user;

  readonly brand = computed(() => this.user()?.role === UserRole.SystemAdmin
    ? { mark: 'SA', name: 'Panel Sistema', tag: 'ADMINISTRACIÓN' }
    : { mark: 'MB', name: 'Mi Bodega', tag: 'GESTIÓN DE CRÉDITO' }
  );

  readonly items = computed<NavItem[]>(() => {
    if (this.user()?.role === UserRole.SystemAdmin) {
      return [
        { label: 'Comercios',  initial: 'C', route: '/app/system/stores' },
        { label: 'Usuarios',   initial: 'U', route: '/app/system/users' },
        { label: 'Bitácora',   initial: 'B', route: '/app/system/operation-logs' },
      ];
    }
    return [
      { label: 'Inicio',             initial: 'I', route: '/app/store/dashboard' },
      { label: 'Clientes',           initial: 'C', route: '/app/store/credit-profiles' },
      { label: 'Ventas a crédito',   initial: 'V', route: '/app/store/credit-sales' },
      { label: 'Solicitudes',        initial: 'S', route: '/app/store/purchase-requests' },
      { label: 'Catálogo',           initial: 'P', route: '/app/store/products' },
      { label: 'Pagos',              initial: 'G', route: '/app/store/payments' },
      { label: 'Estados de cuenta',  initial: 'E', route: '/app/store/account-statements' },
    ];
  });

  signOut() { this.auth.signOut(); }
  initials(name: string | undefined): string {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }
}
