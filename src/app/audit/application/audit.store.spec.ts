import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuditStore } from './audit.store';
import { OperationLogsApiEndpoint } from '../infrastructure/operation-logs-api-endpoint';
import { OperationLog } from '../domain/model/operation-log.entity';

const anHttp = {} as HttpClient;

describe('AuditStore (solo lectura)', () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditStore, { provide: HttpClient, useValue: anHttp }],
    });
  });

  it('expone solo signals de lectura, no metodos de escritura', () => {
    const store = TestBed.inject(AuditStore);
    // API publica: load + 3 signals. Nunca crear/editar/borrar.
    const publicKeys = Object.keys(store).filter((k) => !k.startsWith('#'));
    const forbidden = ['create', 'update', 'delete', 'remove', 'save', 'edit'];
    for (const bad of forbidden) {
      expect((store as unknown as Record<string, unknown>)[bad]).toBeUndefined();
    }
    expect(typeof store.load).toBe('function');
    expect(publicKeys).toEqual(expect.arrayContaining(['logs', 'loading', 'error']));
  });

  it('load() sin filtros populariza logs() y apaga loading', () => {
    const data = [{ id: 1 }, { id: 2 }] as unknown as OperationLog[];
    vi.spyOn(OperationLogsApiEndpoint.prototype, 'list').mockReturnValue(of(data));

    const store = TestBed.inject(AuditStore);
    store.load();

    expect(store.logs()).toEqual(data);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('load() reenvia todos los filtros al endpoint combinados', () => {
    const spy = vi.spyOn(OperationLogsApiEndpoint.prototype, 'list').mockReturnValue(of([]));
    const store = TestBed.inject(AuditStore);

    const filter = { userId: 7, action: 'CREATE', entity: 'Store', from: '2026-01-01', to: '2026-12-31' };
    store.load(filter);

    expect(spy).toHaveBeenCalledWith(filter);
  });

  it('load() con error expone el mensaje y apaga loading', () => {
    vi.spyOn(OperationLogsApiEndpoint.prototype, 'list').mockReturnValue(
      throwError(() => new Error('GET all: sin permiso')),
    );
    const store = TestBed.inject(AuditStore);
    store.load();

    expect(store.error()).toBe('GET all: sin permiso');
    expect(store.loading()).toBe(false);
    expect(store.logs()).toEqual([]);
  });
});
