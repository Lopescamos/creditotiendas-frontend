# Contrato de API — qué consume el frontend

Mapeo detallado, por bounded context, de qué endpoint del backend usa
cada parte del frontend web: método, URL, rol, forma del request/
response relevante para la UI, y a qué vista alimenta. Es la fuente de
verdad **desde el lado del frontend** — el detalle de reglas de negocio
de cada endpoint vive en el backend (`docs/estado-<bc>.md`).

---

## IAM

### `POST /api/v1/authentication/sign-in`
- **Rol:** público
- **Request:** `{ email, password }`
- **Response:** `{ token, user: { id, email, nombre, apellido, roles: [...] }, storeIds: [...] }`
- **Consumido por:** `iam/application/auth.store.ts` → `login()`
- **UI:** `presentation/views/login`

### `GET /api/v1/users/me`
- **Rol:** autenticado
- **Consumido por:** `auth.store.ts` → hidratar sesión al recargar la app

### `GET /api/v1/users`
- **Rol:** `SYSTEM_ADMIN`
- **Response:** lista paginada de usuarios con sus roles
- **Consumido por:** `users-list`

### `POST /api/v1/users`
- **Rol:** `SYSTEM_ADMIN` (cualquier rol) o `STORE_ADMIN` (solo `CLIENT`)
- **Request:** `{ email, nombre, apellido, password, roleId }`
- **Consumido por:** `user-form` (crear)

### `GET|PUT /api/v1/users/{id}`
- **Rol:** `SYSTEM_ADMIN`
- **Consumido por:** `user-form` (editar)

### `PATCH /api/v1/users/{id}/status`
- **Rol:** `SYSTEM_ADMIN`
- **Request:** `{ active: boolean }`
- **Consumido por:** `users-list` (toggle activar/desactivar)

### `POST /api/v1/users/{id}/stores` · `DELETE /api/v1/users/{id}/stores/{storeId}`
- **Rol:** `SYSTEM_ADMIN`
- **Consumido por:** `user-form` (vincular/desvincular tienda)

### `GET /api/v1/roles`
- **Rol:** `SYSTEM_ADMIN`
- **Consumido por:** `user-form` (combo de roles)

---

## Store Management

### `POST|GET /api/v1/stores`
- **Rol:** `SYSTEM_ADMIN`
- **Request (POST):** `{ ruc, razonSocial, nombreComercial, direccion, telefono }`
- **Consumido por:** `stores-list`, `store-form`

### `GET|PUT /api/v1/stores/{id}` · `PATCH /api/v1/stores/{id}/status`
- **Rol:** `SYSTEM_ADMIN`
- **Consumido por:** `store-form`, `stores-list`

### `POST|GET /api/v1/stores/{storeId}/products`
- **Rol:** `STORE_ADMIN`
- **Request (POST):** `{ nombre, descripcion, proveedor, marca, measurementUnitId, precioContado, precioCredito, tipo }`
- **Consumido por:** `products-list`, `product-form`

### `GET|PUT /api/v1/products/{id}` · `PATCH /api/v1/products/{id}/status`
- **Rol:** `STORE_ADMIN`
- **Consumido por:** `product-form`, `products-list`

### `POST /api/v1/products/{id}/image` (multipart `file`)
- **Rol:** `STORE_ADMIN`
- **Response:** `{ imageUrl }` (URL de Cloudinary)
- **Consumido por:** `product-form`
- **Nota:** pendiente #3 — falta manejo de progreso/error de subida.

### `GET /api/v1/currencies` · `GET /api/v1/measurement-units`
- **Rol:** autenticado
- **Consumido por:** `store-form`, `product-form` (combos)

---

## Credit Management

### `POST|GET /api/v1/stores/{storeId}/credit-profiles`
- **Rol:** `STORE_ADMIN`
- **Request (POST):** `{ clienteId, tasa, tipoTasa, moneda, limiteCredito, plazoMaximoDias, diaCorte, diaPago, tasaMoratoria }`
- **Consumido por:** `credit-profiles-list`, `credit-profile-form`

### `GET|PUT /api/v1/credit-profiles/{id}` · `PATCH .../status`
- **Rol:** `STORE_ADMIN` (dueño del perfil)
- **Consumido por:** `credit-profile-form`, `credit-profiles-list`

### `POST /api/v1/credit-profiles/{id}/credit-sale-simulations`
- **Rol:** `STORE_ADMIN`
- **Request:** `{ items: [{ productoId, cantidad }], modalidad, plazoDias, diasGracia }`
- **Response:** cronograma simulado (no persiste nada)
- **Consumido por:** `credit-sale-wizard` (paso de vista previa)

### `POST|GET /api/v1/credit-profiles/{id}/credit-sales`
- **Rol:** `STORE_ADMIN`
- **Request (POST):** igual al de simulación, pero persiste
- **Response:** venta creada con snapshot de 5 columnas de tasa
- **Consumido por:** `credit-sale-wizard` (confirmar), `credit-sales-list`

### `GET /api/v1/credit-sales/{id}` · `GET /api/v1/credit-sales/{id}/payment-plan`
- **Rol:** `STORE_ADMIN`
- **Estado:** ⚠️ **pendiente de consumir** — ver `state/pendientes.md` #2.
  El endpoint existe y ya devuelve el cronograma completo por cuota.

### `GET /api/v1/stores/{storeId}/purchase-requests?status=`
- **Rol:** `STORE_ADMIN`
- **Consumido por:** `purchase-requests-inbox`

### `POST /api/v1/purchase-requests/{id}/approval` · `.../rejection`
- **Rol:** `STORE_ADMIN`
- **Request (rejection):** `{ motivo }` (obligatorio)
- **Efecto:** `approval` genera `credit-sale` automáticamente en la
  misma transacción — el frontend no hace un segundo request.
- **Consumido por:** `purchase-requests-inbox`

---

## Billing

### `GET /api/v1/stores/{id}/installments-due`
- **Rol:** `STORE_ADMIN`
- **Consumido por:** `installments-due`

### `GET /api/v1/credit-profiles/{id}/payment-due?installmentIds=`
- **Rol:** `STORE_ADMIN`
- **Response:** `{ capital, interes, mora, total }` (desglose, sin campo editable)
- **Consumido por:** `register-payment` (antes de confirmar)

### `POST /api/v1/credit-profiles/{id}/payments`
- **Rol:** `STORE_ADMIN`
- **Request:** `{ installmentIds: [...] }` — **sin monto**, el backend lo calcula
- **Response:** `{ allocations: [{ installmentId, mora, interes, capital }] }`
- **Consumido por:** `register-payment` (confirmar)

### `GET /api/v1/credit-profiles/{id}/account-statements` · `GET /api/v1/account-statements/{id}`
- **Rol:** `STORE_ADMIN` / autenticado (detalle)
- **Consumido por:** `account-statements-list`

### `POST /api/v1/admin/billing/jobs/overdue-sweep?asOf=` · `.../account-statements?asOf=`
- **Rol:** `SYSTEM_ADMIN`
- **Estado:** ⚠️ **pendiente de consumir** — ver `state/pendientes.md` #4.
  No hay vista; hoy se dispara con curl/Postman.

---

## Audit

### `GET /api/v1/operation-logs?userId=&action=&entity=&from=&to=`
- **Rol:** `SYSTEM_ADMIN`
- **Response:** lista paginada, solo lectura
- **Consumido por:** `operation-logs`
- **Nota:** no existe ningún método de escritura en este BC — el único
  escritor es el aspect de auditoría del backend.

---

## Reglas transversales

- Todo endpoint de escritura puede devolver **422** con el motivo de
  negocio (elegibilidad, pago parcial, RUC duplicado, etc.) — se
  muestra tal cual, nunca se reinterpreta en frontend.
- El aislamiento multi-tenant lo garantiza el backend
  (`@PreAuthorize` + filtro por tienda) — el frontend no duplica esa
  validación, solo oculta UI que el usuario no podría usar de todos
  modos.
- Ningún endpoint de `payments` ni `credit-sales` acepta un monto
  calculado en frontend — todos los montos exigibles/cronogramas salen
  del backend.
