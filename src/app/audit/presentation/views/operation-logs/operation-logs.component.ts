import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuditStore } from '../../../application/audit.store';
import { OperationAction } from '../../../domain/model/operation-log.entity';

@Component({
  selector: 'app-operation-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './operation-logs.component.html',
})
export class OperationLogsComponent implements OnInit {
  protected store = inject(AuditStore);
  readonly actions = Object.values(OperationAction);

  protected filter = signal<{ userId?: number; action?: string; entity?: string; from?: string; to?: string }>({});

  ngOnInit() { this.store.load(); }

  apply() {
    const f = this.filter();
    this.store.load({
      userId: f.userId || undefined,
      action: f.action || undefined,
      entity: f.entity?.trim() || undefined,
      from: f.from ? new Date(f.from).toISOString() : undefined,
      to:   f.to ? new Date(f.to).toISOString() : undefined,
    });
  }

  reset() { this.filter.set({}); this.store.load(); }

  update<K extends keyof ReturnType<typeof this.filter>>(k: K, v: ReturnType<typeof this.filter>[K]) {
    this.filter.update((f) => ({ ...f, [k]: v }));
  }

  actionBadge(a: string) {
    if (a === 'CREATE' || a === 'REGISTER' || a === 'APPROVE' || a === 'SIGN_IN') return 'ct-badge ct-badge--success';
    if (a === 'UPDATE' || a === 'PATCH' || a === 'ASSIGN' || a === 'UPLOAD') return 'ct-badge ct-badge--warning';
    if (a === 'DELETE' || a === 'REJECT' || a === 'SIGN_IN_FAILED' || a === 'UNASSIGN') return 'ct-badge ct-badge--danger';
    return 'ct-badge ct-badge--neutral';
  }
}
