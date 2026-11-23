# Guía de arquitectura por capas (DDD) — Frontend CreditoTiendas

Esta es la **única fuente de verdad** de convenciones para el frontend web
(Angular 21 standalone). Los agentes de `.claude/agents/` la leen antes de
tocar código — no inventes un patrón distinto al descrito aquí.

## 1. Stack y principios

- Angular 21, **standalone components** (sin NgModules), `Signals`
  (`signal`/`computed`/`.asReadonly()`) como única forma de estado reactivo
  — nada de `BehaviorSubject` para estado de UI.
- Angular Material para componentes de UI; paleta y tokens en
  `src/styles.css` y `src/material-theme.scss` — no hardcodear colores.
- Un **bounded context por carpeta** bajo `src/app/`, calcado del backend:
  `iam`, `store-management`, `credit-management`, `billing`, `audit`,
  más `shared` (kernel transversal, no es un BC de negocio).
- Cada BC se organiza en 4 capas, siempre en este orden de dependencia:
  `domain → infrastructure → application → presentation`. Una capa nunca
  importa de una capa "de más arriba" (p. ej. `domain` no importa de
  `infrastructure`).

## 2. Estructura de carpetas por bounded context

```
src/app/<bc>/
  domain/
    model/            # interfaces, enums, tipos puros (sin lógica async)
  infrastructure/
    <recurso>-api-endpoint.ts   # un endpoint por recurso del backend
    <recurso>.interceptor.ts    # solo si el BC aporta uno (p. ej. iam)
  application/
    <bc>.store.ts      # estado del BC con signals + métodos de orquestación
  presentation/
    guards/            # solo si el BC define guards propios (p. ej. iam)
    layouts/           # solo `shared` tiene el app-shell
    views/<vista>/
      <vista>.component.ts
      <vista>.component.html
      <vista>.component.css
```

## 3. Flujo para construir (o continuar) un bounded context

1. **Domain** — define los modelos (`interface`), enums y tipos de este BC
   tal como los expone el backend (revisa `docs/estado-<bc>.md` si existe,
   o los DTOs reales del endpoint).
2. **Infrastructure** — un `XxxApiEndpoint` por recurso, extendiendo
   `BaseApiEndpoint` (sección 5). Nunca llames `HttpClient` directo desde
   `application` o `presentation`.
3. **Application** — un `XxxStore` con signals privados + `computed`
   públicos en solo lectura (`.asReadonly()`), y métodos que llaman al
   endpoint y actualizan el signal. Aquí vive la orquestación (p. ej.
   "simular antes de registrar", "revisar elegibilidad antes de mostrar
   el catálogo").
4. **Presentation** — vistas standalone que inyectan el store (nunca el
   endpoint directo), con `@Component({ imports: [...] })` explícitos.
   Rutas lazy (`loadComponent`) añadidas a `app.routes.ts`, protegidas con
   `authGuard`/`roleGuard` según el rol que corresponda (ver
   `docs/user-stories.md` de este repo para saber qué rol y qué US cubre).
5. Al terminar cada capa, deja un resumen en
   `state/estado-frontend-<bc>.md` bajo una sección con el nombre de la
   capa — el siguiente agente lo lee en vez de adivinar.

## 4. Domain layer

- Solo `interface`/`type`/`enum`. Cero llamadas HTTP, cero `inject()`.
- Los campos deben calzar exactamente con lo que el backend devuelve
  (revisa `docs/estado-<bc>.md` del backend o el DTO real) — no inventes
  ni omitas campos "porque no se usan todavía".
- Si un modelo tiene un snapshot de tasas o condiciones (p. ej.
  `CreditSale`), decláralo completo aunque la vista actual no muestre
  todos los campos.

## 5. Infrastructure layer

- Todo endpoint extiende `BaseApiEndpoint<T>` (`src/app/shared/`), que ya
  resuelve `GET/POST/PUT/PATCH/DELETE` + mapeo de errores 403/404/422.
- Un `BaseAssembler` por recurso si la forma del `BaseResponse` del
  backend difiere del modelo de dominio (fechas, nombres de campo, etc.).
- La URL base sale de `environment.apiBaseUrl` — nunca hardcodear
  `http://localhost:8080`.
- Si el BC necesita autenticación especial (interceptor, refresh de
  token), va aquí, no en `application`.
- Qué endpoint exacto consumir (método, URL, rol) está en
  `docs/contrato-api.md` — no inventes una ruta ni adivines el verbo
  HTTP.

## 6. Application layer

- Un store por BC (a veces dos si el BC es grande, p. ej.
  `credit-management.store.ts` y uno dedicado a simulaciones).
- Signals privados (`#state = signal<T>(...)`) + `computed` públicos
  expuestos como `.asReadonly()`. Nunca exponer el `signal` mutable
  directamente a `presentation`.
- Los métodos del store devuelven `Promise`/`Observable` según el patrón
  ya usado en los stores existentes (revisa `iam.store.ts` como
  referencia de estilo antes de improvisar uno nuevo).
- Reglas de negocio que el backend ya valida (elegibilidad, no pagos
  parciales, etc.) también se reflejan aquí a nivel de UI (deshabilitar
  botones, mostrar mensajes), pero la fuente de verdad sigue siendo el
  backend — nunca dupliques la regla "silenciando" el error del backend.

## 7. Presentation layer

- Vistas 100% standalone, sin `NgModule`.
- Usa las clases utilitarias ya definidas en `styles.css`
  (`.ct-card`, `.ct-badge`, `.ct-table`, `.ct-kpi`, `.ct-bars`) antes de
  escribir CSS nuevo — mantiene consistencia visual con el resto del
  panel.
- Las rutas van en `app.routes.ts`, agrupadas por rol (`/app/system/*`
  para `SYSTEM_ADMIN`, `/app/store/*` para `STORE_ADMIN`), con
  `roleGuard([...])` en el nodo padre del grupo, no en cada hijo.
- Formularios con `ReactiveFormsModule` + validadores síncronos; los
  errores de servidor (422) se muestran tal cual los devuelve el backend,
  no se re-interpretan.
- Antes de crear una vista o ruta nueva, revisa `docs/userflow.md` para
  confirmar dónde encaja en el flujo del rol, y `docs/user-stories.md`
  para saber qué US cubre (así queda registrado, no solo "porque sí").

## 8. Tabla de nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Modelo de dominio | `PascalCase`, sustantivo | `CreditProfile` |
| Enum | `PascalCase` | `CreditProfileStatus` |
| Endpoint | `<recurso>-api-endpoint.ts` | `credit-profiles-api-endpoint.ts` |
| Store | `<bc>.store.ts` | `credit-management.store.ts` |
| Vista (carpeta) | `kebab-case` | `credit-profile-form/` |
| Componente (clase) | `PascalCase` + `Component` | `CreditProfileFormComponent` |
| Ruta | `kebab-case`, plural para listas | `/app/store/credit-profiles` |

## 9. Checklist antes de dar una capa por terminada

- [ ] ¿El modelo de dominio calza 1:1 con lo que el backend expone?
- [ ] ¿El endpoint maneja 403/404/422 vía `BaseApiEndpoint` (no un
      `catchError` suelto)?
- [ ] ¿El store expone solo `computed`/`.asReadonly()`, nunca el signal
      mutable?
- [ ] ¿La vista usa las clases `.ct-*` existentes antes de CSS nuevo?
- [ ] ¿La ruta está protegida con el guard de rol correcto?
- [ ] ¿Quedó un resumen en `state/estado-frontend-<bc>.md` para la
      siguiente capa?
