# CreditoTiendas Frontend (Admin Web)

Frontend **Angular 21** para los administradores de **CreditoTiendas** — plataforma multi-tenant de crédito fiado (SI642 Finanzas e Ingeniería Económica, UPC 2026-20, NRC 7691, Grupo 4).

Este frontend cubre **solo la parte admin** (SYSTEM_ADMIN y STORE_ADMIN). La app del cliente va aparte como app Android nativa (Kotlin + Jetpack Compose), ambas consumiendo el mismo backend Spring Boot 4.

## Stack

- Angular 21 (standalone components, signals)
- Angular Material + Material Symbols
- DDD por bounded contexts: `iam`, `store-management`, `credit-management`, `billing`, `audit`, `shared`
- Interfaz basada en el Figma del equipo — verde oscuro primario (`#0E3C2A`), acento lima (`#BEF264`), tipografía Inter

## Alcance por rol

### SYSTEM_ADMIN — `/app/system/*`
- **Comercios** (US-13): alta, edición, activar/desactivar — RUC único, 11 dígitos.
- **Usuarios y roles** (US-14): crear admin de tienda (vinculado a una tienda activa) o cliente. Contraseña hasheada en backend.
- **Bitácora** (US-16): logs append-only con filtros por usuario, acción, entidad y fecha.

### STORE_ADMIN — `/app/store/*`
- **Inicio** (US-01): KPIs reales (total por cobrar, cobrado, en mora), gráfico mensual, breakdown por estado, movimientos recientes.
- **Clientes y condiciones** (US-04): perfil crediticio con todas las condiciones — tasa + tipo (nominal/efectiva) + período capitalización + tasa moratoria + plazo máx. + día corte + día pago.
- **Catálogo** (US-11): productos/servicios con precio contado + precio crédito, imagen (upload multipart), activar/desactivar.
- **Ventas a crédito** (US-02): wizard con selección cliente → productos → modalidad → plazo/gracia → simulación del plan (método francés) → confirmar. Valida que el total no exceda el crédito disponible.
- **Solicitudes de compra** (US-12): bandeja filtrable, aprobar (genera venta automáticamente) o rechazar con motivo.
- **Pagos y mora** (US-05): bandeja de vencimientos del día. Seleccionar cuotas de UN cliente → pantalla de desglose → confirmar. **No hay pagos parciales** (el backend lo rechaza) y aplica prelación mora → interés → capital.
- **Estados de cuenta** (US-06): listado por perfil, se generan automáticamente en el día de corte.

## Arquitectura DDD

```
src/app/<bounded-context>/
├── domain/model/         → entidades (clases), enums de dominio
├── infrastructure/       → response/resource DTOs, assemblers, api-endpoints
├── application/          → stores con Angular Signals (loading/error/state)
└── presentation/         → views y components Angular standalone
```

Base reutilizable en `shared/infrastructure/`: `BaseEntity`, `BaseResource`, `BaseResponse`, `BaseAssembler`, `BaseApiEndpoint` (CRUD HTTP genérico con manejo de 403/404/422).

## Endpoints consumidos (del backend Spring Boot 4)

| Contexto | Endpoints |
|---|---|
| **IAM** | `POST /api/v1/authentication/sign-in` · `GET/POST/PUT/PATCH /api/v1/users` · `POST /users/{id}/stores` · `DELETE /users/{id}/stores/{storeId}` · `GET /api/v1/users/me` · `GET /api/v1/roles` |
| **Store Management** | `GET/POST/PUT /api/v1/stores`, `PATCH /stores/{id}/status` · `GET/POST /api/v1/stores/{storeId}/products` · `GET/PUT /api/v1/products/{id}`, `PATCH /products/{id}/status`, `POST /products/{id}/image` (multipart) · `GET /api/v1/currencies`, `/measurement-units` |
| **Credit Management** | `GET/POST /api/v1/stores/{storeId}/credit-profiles` · `GET/PUT /api/v1/credit-profiles/{id}`, `PATCH .../status` · `POST /credit-profiles/{id}/credit-sale-simulations` · `POST/GET /credit-profiles/{id}/credit-sales` · `GET /api/v1/credit-sales/{id}`, `.../payment-plan` · `GET /credit-profiles/{id}/purchase-request-eligibility` · `GET /api/v1/stores/{storeId}/purchase-requests?status=` · `POST /api/v1/purchase-requests/{id}/approval|rejection` |
| **Billing** | `GET /api/v1/credit-sales/{id}/installments` · `GET /api/v1/stores/{id}/installments-due` · `GET /credit-profiles/{id}/payment-due?installmentIds=` · `POST /credit-profiles/{id}/payments` (sin monto — backend lo calcula) · `GET /credit-profiles/{id}/payments` · `GET /credit-profiles/{id}/account-statements`, `GET /api/v1/account-statements/{id}` |
| **Audit** | `GET /api/v1/operation-logs?userId=&action=&entity=&from=&to=` |

## Reglas de negocio reflejadas

- **Roles fijos**: `SYSTEM_ADMIN`, `STORE_ADMIN`, `CLIENT` (CLIENT usa la app móvil Android).
- **Snapshot de tasas** (`Venta_Credito`): 5 columnas `*_snapshot` cargadas al registrar la venta — editar el perfil nunca modifica ventas existentes.
- **Método francés**: cuota fija R = C' × i / (1 − (1+i)^−n), con gracia total que capitaliza C' = C₀(1+TED)^dg.
- **Validación de línea**: no permite venta cuyo total exceda el crédito disponible.
- **Pagos sin monto**: la UI envía solo `installmentIds`; el backend calcula el monto exigible y rechaza pagos parciales.
- **Prelación obligatoria**: mora → interés → capital, aplicada en backend; la UI lo comunica al usuario.
- **Multi-tenant**: todas las vistas del STORE_ADMIN filtran por su `storeId` activo (del JWT).
- **Elegibilidad para solicitud de compra** (US-08): perfil activo + al menos una compra pagada a tiempo + sin cuotas vencidas + dentro de disponible. Se valida en backend; la app móvil consulta `purchase-request-eligibility` antes de dejar enviar.
- **Aprobación automática** (US-12): al aprobar una solicitud, backend genera la `Venta_Credito` con `Detalle_Venta` en una sola transacción.
- **Bitácora append-only** (US-16): escrita por Spring AOP; la UI solo lee y filtra.

## Correr en local

```bash
npm install
npm start               # http://localhost:4200
```

Backend esperado en `http://localhost:8080`. Cambiar en `src/environments/environment.ts` si está en otro host.
CORS en el backend debe permitir `http://localhost:4200` (perfil `dev` ya lo trae por defecto).

## Decisiones

- Nombres de entidades en TypeScript en inglés (`CreditProfile`, `CreditSale`) aunque las tablas en BD estén en español — el backend expone los recursos en inglés (la naming strategy mapea `CreditSalePersistenceEntity → credit_sales`).
- Login persiste JWT y user en `localStorage` bajo `ct.auth.token` / `ct.auth.user`. Logout limpia ambos.
- Cada STORE_ADMIN opera sobre su primera `storeId`; si en el futuro un admin administra varias, se agrega un selector en el topbar.
- La vista de Clientes crea el perfil de crédito (US-04), **no** crea el usuario cliente — eso se hace desde Usuarios (US-14) con `POST /api/v1/users`, rol `CLIENT`, y luego el Store Admin abre el perfil para ese `clientUserId` en su tienda.

## Lo que falta / próximos pasos

- Selector de tienda en el topbar para `STORE_ADMIN` vinculados a múltiples tiendas (hoy toma la primera).
- Vista de detalle de una venta con cronograma real (`/credit-sales/{id}/payment-plan`).
- Integración con Cloudinary al subir imagen (hoy solo envía multipart al endpoint `POST /products/{id}/image`).
- Pantalla de disparo manual de jobs Billing para SYSTEM_ADMIN (`/admin/billing/jobs/overdue-sweep` y `/account-statements`).
