# Contrato de API — qué consume el frontend

Mapeo, por bounded context, de qué endpoint del backend usa cada parte
del frontend web. Es la fuente de verdad **desde el lado del frontend**:
si el backend cambia uno de estos contratos, esta tabla te dice qué
`*-api-endpoint.ts` y qué vista hay que tocar. El detalle completo de
cada endpoint (request/response, reglas de negocio) vive en el repo del
backend, en `docs/estado-<bc>.md`.

## IAM

| Endpoint | Rol | Consumido por |
|---|---|---|
| `POST /api/v1/authentication/sign-in` | público | `iam/application/auth.store.ts` (login) |
| `GET /api/v1/users/me` | autenticado | `auth.store.ts` (hidratar sesión) |
| `GET /api/v1/users` | `SYSTEM_ADMIN` | `presentation/views/users-list` |
| `POST /api/v1/users` | `SYSTEM_ADMIN` / `STORE_ADMIN` (solo rol `CLIENT`) | `presentation/views/user-form` |
| `GET\|PUT /api/v1/users/{id}` | `SYSTEM_ADMIN` | `user-form` (editar) |
| `PATCH /api/v1/users/{id}/status` | `SYSTEM_ADMIN` | `users-list` (activar/desactivar) |
| `POST /api/v1/users/{id}/stores`, `DELETE .../stores/{storeId}` | `SYSTEM_ADMIN` | `user-form` (vincular a tienda) |
| `GET /api/v1/roles` | `SYSTEM_ADMIN` | `user-form` (combo de roles) |

## Store Management

| Endpoint | Rol | Consumido por |
|---|---|---|
| `POST\|GET /api/v1/stores` | `SYSTEM_ADMIN` | `presentation/views/stores-list`, `store-form` |
| `GET\|PUT /api/v1/stores/{id}`, `PATCH .../status` | `SYSTEM_ADMIN` | `store-form`, `stores-list` |
| `POST\|GET /api/v1/stores/{storeId}/products` | `STORE_ADMIN` | `products-list`, `product-form` |
| `GET\|PUT /api/v1/products/{id}`, `PATCH .../status` | `STORE_ADMIN` | `product-form`, `products-list` |
| `POST /api/v1/products/{id}/image` (multipart) | `STORE_ADMIN` | `product-form` (upload Cloudinary) |
| `GET /api/v1/currencies`, `GET /api/v1/measurement-units` | autenticado | `store-form`, `product-form` (combos) |

## Credit Management

| Endpoint | Rol | Consumido por |
|---|---|---|
| `POST\|GET /api/v1/stores/{storeId}/credit-profiles` | `STORE_ADMIN` | `credit-profiles-list`, `credit-profile-form` |
| `GET\|PUT /api/v1/credit-profiles/{id}`, `PATCH .../status` | `STORE_ADMIN` | `credit-profile-form`, `credit-profiles-list` |
| `POST /api/v1/credit-profiles/{id}/credit-sale-simulations` | `STORE_ADMIN` | `credit-sale-wizard` (paso de vista previa) |
| `POST\|GET /api/v1/credit-profiles/{id}/credit-sales` | `STORE_ADMIN` | `credit-sale-wizard`, `credit-sales-list` |
| `GET /api/v1/credit-sales/{id}`, `.../payment-plan` | `STORE_ADMIN` | **pendiente de consumir** — ver `state/pendientes.md` #2 |
| `GET /api/v1/stores/{storeId}/purchase-requests?status=` | `STORE_ADMIN` | `purchase-requests-inbox` |
| `POST /api/v1/purchase-requests/{id}/approval\|rejection` | `STORE_ADMIN` | `purchase-requests-inbox` |

## Billing

| Endpoint | Rol | Consumido por |
|---|---|---|
| `GET /api/v1/stores/{id}/installments-due` | `STORE_ADMIN` | `installments-due` |
| `GET /api/v1/credit-profiles/{id}/payment-due?installmentIds=` | `STORE_ADMIN` | `register-payment` (desglose antes de confirmar) |
| `POST /api/v1/credit-profiles/{id}/payments` | `STORE_ADMIN` | `register-payment` (confirmar — sin monto, el backend calcula) |
| `GET /api/v1/credit-profiles/{id}/account-statements` | `STORE_ADMIN` | `account-statements-list` |
| `GET /api/v1/account-statements/{id}` | autenticado | `account-statements-list` (detalle) |
| `POST /api/v1/admin/billing/jobs/overdue-sweep\|account-statements` | `SYSTEM_ADMIN` | **pendiente de consumir** — ver `state/pendientes.md` #4 |

## Audit

| Endpoint | Rol | Consumido por |
|---|---|---|
| `GET /api/v1/operation-logs?userId=&action=&entity=&from=&to=` | `SYSTEM_ADMIN` | `presentation/views/operation-logs` |

## Notas generales

- Todos los endpoints de escritura devuelven 422 con el motivo de negocio
  (elegibilidad, pago parcial, RUC duplicado, etc.) — el frontend muestra
  ese mensaje tal cual, no lo reinterpreta (ver
  `docs/guia-arquitectura-frontend-ddd.md`, sección 7).
- El aislamiento multi-tenant (un `STORE_ADMIN` nunca ve datos de otra
  tienda) lo garantiza el backend vía `@PreAuthorize` — el frontend no
  duplica esa validación, solo oculta UI que el usuario no podría usar.
