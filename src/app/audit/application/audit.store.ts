import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OperationLog } from '../domain/model/operation-log.entity';
import { OperationLogsApiEndpoint, OperationLogsFilter } from '../infrastructure/operation-logs-api-endpoint';

@Injectable({ providedIn: 'root' })
export class AuditStore {
  private ep = new OperationLogsApiEndpoint(inject(HttpClient));
  private logsSignal = signal<OperationLog[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly logs = this.logsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  load(filter: OperationLogsFilter = {}) {
    this.loadingSignal.set(true);
    this.ep.list(filter).subscribe({
      next: (l) => { this.logsSignal.set(l); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
}
