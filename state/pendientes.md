# Pendientes — Frontend Web

Backlog real del frontend (no incluye nada de la app mobile, que es otro
repo). Cuando tomes uno de estos, trátalo como un bounded context chico:
pasa por los 5 agentes en orden y deja tu resumen en
`state/estado-frontend-<item>.md`.

## Backlog

### 1. Selector de tienda multi-tenant para `STORE_ADMIN`
- **BC afectado:** `iam` (sesión) + `shared` (app-shell)
- **Prioridad:** media
- **Por qué falta:** hoy el frontend asume que un `STORE_ADMIN` está
  vinculado a una sola tienda (`storeIds[0]`). El backend ya soporta
  varias (`Usuario_Tienda` es una relación N:N, ver `estado-iam.md`).
- **Depende de:** nada del backend — el dato (`storeIds`) ya viene en el
  `sign-in`. Es trabajo 100% de frontend.

### 2. Detalle de venta al crédito con `payment-plan` real
- **BC afectado:** `credit-management` + `billing`
- **Prioridad:** alta (afecta directamente US-07 visto desde el panel
  del Admin Tienda, hoy solo se ve en la app mobile del cliente)
- **Por qué falta:** `credit-sales-list` no abre un detalle; el endpoint
  `GET /api/v1/credit-sales/{id}/payment-plan` ya existe y no se
  consume desde el web.
- **Depende de:** nada nuevo del backend, el endpoint ya está.

### 3. Pulir subida de imágenes de producto (Cloudinary)
- **BC afectado:** `store-management`
- **Prioridad:** baja
- **Por qué falta:** el upload (`POST /api/v1/products/{id}/image`)
  funciona pero sin barra de progreso ni manejo explícito de error de
  red/archivo muy pesado.
- **Depende de:** nada del backend.

### 4. Pantalla de triggers manuales de `BillingScheduler`
- **BC afectado:** `billing` (vista nueva en `system/*`)
- **Prioridad:** baja (solo para demo/sustentación, no es un flujo de
  usuario final)
- **Por qué falta:** el backend expone
  `POST /api/v1/admin/billing/jobs/overdue-sweep?asOf=` y
  `POST /api/v1/admin/billing/jobs/account-statements?asOf=`
  (`SYSTEM_ADMIN`), pero no hay botón en el panel para dispararlos —
  hoy se prueban con curl/Postman.
- **Depende de:** nada nuevo del backend, los endpoints ya existen.

## Completado

Los 6 bounded contexts (`shared`, `iam`, `store-management`,
`credit-management`, `billing`, `audit`) están implementados de punta a
punta — ver `docs/user-stories.md` para el detalle de qué US cubre cada
uno.
