# User Stories cubiertas por este frontend

Las 16 user stories del proyecto viven documentadas completas en el
backend (`docs/user-stories.md`). Este archivo solo mapea **cuáles
cubre el frontend web** (SYSTEM_ADMIN / STORE_ADMIN) y en qué vista
quedaron implementadas — las de `CLIENT` (US-03, 07, 08, 09, 10, 15) se
cubren en la app mobile, otro repo.

## Admin Sistema

| US | Historia | Vista | Estado |
|---|---|---|---|
| US-13 | Administrar comercios | `system/stores-list`, `system/store-form` | ✅ |
| US-14 | Administrar usuarios y roles | `system/users-list`, `system/user-form` | ✅ |
| US-16 | Consultar bitácora de operaciones | `system/operation-logs` | ✅ |

## Admin Tienda

| US | Historia | Vista | Estado |
|---|---|---|---|
| US-01 | Resumen del comercio (dashboard) | `store/store-dashboard` | ✅ |
| US-02 | Registrar venta a crédito | `store/credit-sale-wizard` | ✅ |
| US-04 | Gestionar clientes y condiciones | `store/credit-profiles-list`, `store/credit-profile-form` | ✅ |
| US-05 | Registrar pagos y revisar mora | `store/installments-due`, `store/register-payment` | ✅ |
| US-06 | Generar estado de cuenta al corte | `store/account-statements-list` | ✅ (solo lectura — la generación es automática en el backend) |
| US-11 | Mantener catálogo | `store/products-list`, `store/product-form` | ✅ |
| US-12 | Revisar solicitudes de compra a crédito | `store/purchase-requests-inbox` | ✅ |

## Fuera del alcance de este frontend (app mobile)

| US | Historia |
|---|---|
| US-03 | Consultar mi cuenta |
| US-07 | Consultar plan de cuotas |
| US-08 | Solicitar compra a crédito |
| US-09 | Consultar estado de solicitud |
| US-10 | Pagar cuenta |
| US-15 | Ayuda financiera |

## Nota sobre US-07 vista desde el panel web

El Admin Tienda hoy **no** tiene una vista propia del cronograma de
cuotas de una venta puntual (eso lo ve el cliente en su app). Es el
pendiente #2 de `state/pendientes.md` — el endpoint ya existe
(`GET /api/v1/credit-sales/{id}/payment-plan`), solo falta la vista.
