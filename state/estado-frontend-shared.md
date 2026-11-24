# Estado — Shared (kernel)

Resumen retroactivo del contexto `shared`. No es un bounded context de
negocio: es el kernel transversal que consumen los otros 5 BCs.

## Domain

- `domain/model/base-entity.ts` — interfaz `BaseEntity` con `id`,
  `createdAt`, `updatedAt` opcionales. Todo modelo de dominio de los
  demás BCs la extiende.
- `domain/model/user-role.enum.ts` — enum `UserRole`
  (`SYSTEM_ADMIN`, `STORE_ADMIN`, `CLIENT`) + mapa `roleLabels` para
  etiquetas en español en la UI.

## Infrastructure

- `infrastructure/base-api.ts` — capa delgada sobre `HttpClient` con
  los verbos `get/post/put/patch/delete` tipados.
- `infrastructure/base-response.ts` — tipos `BaseResource` y
  `BaseResponse<T>` (envoltorio genérico de respuesta del backend).
- `infrastructure/base-assembler.ts` — contrato `BaseAssembler<R,E>`
  que convierte `BaseResource → <Entity>`.
- `infrastructure/base-api-endpoint.ts` — clase genérica
  `BaseApiEndpoint<T>` que todos los endpoints extienden; centraliza
  mapeo de errores 403/404/422 y parsing del envoltorio `BaseResponse`.

## Application

Shared no define store: es kernel, no estado de negocio.

## Presentation

- `presentation/guards/auth.guard.ts` — `authGuard` funcional; lee el
  token de `iam/infrastructure/auth-storage` y bloquea si falta
  (dependencia inversa aceptada: shared conoce la clave del token, no
  el flujo).
- `presentation/guards/role.guard.ts` — `roleGuard(roles[])` factory,
  consulta `AuthStore` para validar rol.
- `presentation/layouts/app-shell/app-shell.component.{ts,html,css}`
  — shell con toolbar + sidenav por rol (`system/*` vs `store/*`).
  Monta el `<router-outlet>` de las rutas hijas de `/app`.
- `presentation/services/notification.service.ts` — wrapper sobre
  `MatSnackBar` para mensajes de éxito/error uniformes.

## Rutas que aporta

Ninguna directa — el app-shell lo monta la rama `feature/iam` cuando
define el nodo `/app`.

## Notas

- Dependencia cruzada conocida: `shared` importa de `iam`
  (`AUTH_TOKEN_KEY`, `AuthStore`). Documentado como deuda de diseño; la
  ruptura del ciclo sería extraer `AUTH_TOKEN_KEY` y una interfaz de
  sesión a `shared/domain`.
- Paleta y tokens: ver `src/styles.css` y `src/material-theme.scss`
  (clases `.ct-card`, `.ct-badge`, `.ct-table`, `.ct-kpi`, `.ct-bars`).
