# Pendientes — Frontend Web

Backlog real del frontend (no incluye nada de la app mobile, que es otro
repo). Cuando tomes uno de estos, trátalo como un bounded context chico:
pasa por los 5 agentes en orden y deja tu resumen en
`state/estado-frontend-<item>.md`.

## Backlog

> Todos los pendientes de la primera iteración (#1–#5) están resueltos
> y mergeados a `develop`. Este archivo se deja con los ítems en la
> sección `## Completado` para no perder trazabilidad. Si surgen
> nuevos pendientes, van arriba de esta nota.

## Completado

Los 6 bounded contexts (`shared`, `iam`, `store-management`,
`credit-management`, `billing`, `audit`) están implementados de punta a
punta — ver `docs/user-stories.md` para el detalle de qué US cubre cada
uno. Cada BC tiene cobertura de prueba sobre su *store*, sus
endpoints críticos y las piezas transversales de infraestructura (ver
sección `## Tests` en cada `state/estado-frontend-<bc>.md`).

### Backlog cerrado en esta iteración

1. **Selector multi-tienda para `STORE_ADMIN`** — resuelto.
   - Rama: `feature/multi-tenant-store-selector` (iam + shared).
   - `AuthStore` expone `activeStoreId` writable + `setActiveStore()`
     con persistencia en `localStorage` (`ACTIVE_STORE_KEY`).
   - El `app-shell` muestra un selector en el topbar cuando el usuario
     tiene 2+ tiendas vinculadas.

2. **Detalle de venta con `payment-plan` real** — resuelto.
   - Rama: `feature/credit-sale-detail` (credit-management + billing).
   - Nueva vista `credit-sale-detail` en `/app/store/credit-sales/:id`
     que combina el snapshot del cronograma (`payment-plan`) con el
     estado real de cada cuota (`billing.saleInstallments`).
   - `credit-sales-list` enlaza el id de venta al nuevo detalle.

3. **Progreso/error en subida Cloudinary** — resuelto.
   - Rama: `feature/store-management` (reutilizada).
   - `ProductsApiEndpoint.uploadImageWithProgress` usa
     `reportProgress: true, observe: 'events'` y publica `UploadEvent`.
   - `store-management.store` expone `uploadProgress` y `uploadError`.
   - `product-form` muestra barra de progreso + bloqueo local de 5 MB.

4. **Pantalla triggers manuales `BillingScheduler`** — resuelto.
   - Rama: `feature/billing` (reutilizada).
   - `BillingJobsApiEndpoint` + `BillingStore.runOverdueSweep()` /
     `runAccountStatements()`.
   - Nueva vista `billing-jobs` en `/app/system/billing-jobs` (solo
     `SYSTEM_ADMIN`) + link en el sidebar.

5. **Ampliar cobertura de pruebas** — resuelto.
   - Rama: `test/coverage-extended`.
   - Specs nuevos por recurso:
     `iam/infrastructure/authentication-api.spec.ts`,
     `billing/infrastructure/installments-api-endpoint.spec.ts`,
     `billing/infrastructure/billing-jobs-api-endpoint.spec.ts`,
     `credit-management/infrastructure/credit-sales-api-endpoint.spec.ts`.
