# Estado — Audit

Bitácora de operaciones. Bounded context **100% de solo lectura**:
no existe ningún método de escritura; el único escritor es el aspect
de auditoría del backend.

## Domain

- `OperationLog` — entrada de bitácora con `userId`, `action`,
  `entity`, `entityId`, `payload`, `occurredAt`.
- `OperationAction` — enum de acciones auditadas.

## Infrastructure

- `operation-logs-api-endpoint.ts` — `GET /operation-logs` con
  filtros opcionales `userId`, `action`, `entity`, `from`, `to`
  (todos combinables).

## Application

- `audit.store.ts` — signals de resultados paginados y filtros
  actuales. Sin métodos de escritura.

## Presentation

- `views/operation-logs` — US-16 (UF-04), listado filtrable solo
  lectura. Sin botones de crear/editar/borrar, ni siquiera
  deshabilitados.

## Rutas que aporta

- `app/system/operation-logs` dentro del nodo `system`
  (`roleGuard([SystemAdmin])`).

## US / UF cubiertos

- US-16 — Consultar bitácora de operaciones (UF-04).

## Notas

- Ningún otro BC consume `audit.store`: es terminal.
