# Estado — Credit Management

Perfiles de crédito, simulación, ventas al crédito y bandeja de
solicitudes de compra.

## Domain

- `CreditProfile` — condiciones pactadas por cliente (tasa, tipo de
  tasa, moneda, límite, plazo máximo, día de corte, día de pago, tasa
  moratoria).
- `CreditSale` — venta al crédito con **snapshot** de condiciones (no
  se recalcula si cambia el perfil después).
- `PaymentPlan` + `ScheduledInstallment` — cronograma que devuelve el
  backend al confirmar la venta.
- `SaleLineItem` — renglón de productos dentro del wizard.
- `PurchaseRequest` — solicitud del cliente desde la app mobile; se
  aprueba o rechaza desde el panel.
- `Eligibility` — las 4 condiciones (ver `docs/contrato-api.md`).

## Infrastructure

- `credit-profiles-api-endpoint.ts` — CRUD + `PATCH .../status` +
  simulación (`POST .../credit-sale-simulations`).
- `credit-sales-api-endpoint.ts` — `POST/GET
  /credit-profiles/{id}/credit-sales`, `GET /credit-sales/{id}`,
  `GET /credit-sales/{id}/payment-plan` (⚠️ pendiente #2: existe pero
  no se consume todavía).
- `purchase-requests-api-endpoint.ts` — listado por tienda,
  `POST .../approval`, `POST .../rejection` (motivo obligatorio).

## Application

- `credit-management.store.ts` — signals de perfiles, ventas,
  solicitudes y último cronograma simulado. Orquesta "simular antes
  de registrar": no permite confirmar venta si la simulación devolvió
  que excede crédito disponible.

## Presentation

- `views/store-dashboard` — US-01 (UF-05), KPIs + gráfico; consume
  también `billing.store` para mora/vencimientos.
- `views/credit-profiles-list` + `credit-profile-form` — US-04
  (UF-06).
- `views/credit-sales-list` — US-02 vista histórica; abrir detalle
  (payment-plan) es pendiente #2.
- `views/credit-sale-wizard` — US-02 (UF-07), stepper: cliente →
  productos → modalidad/plazo → simular → confirmar.
- `views/purchase-requests-inbox` — US-12 (UF-08); aprobar genera la
  venta automáticamente en backend (sin segundo request).

## Rutas que aporta

- `app/store/dashboard` — landing del `STORE_ADMIN`.
- `app/store/credit-profiles`, `/new`, `/:id/edit`.
- `app/store/credit-sales`, `/new` (wizard).
- `app/store/purchase-requests`.
- Reapunta `app/store` → `dashboard` (antes `products`).

## US / UF cubiertos

- US-01, US-02, US-04, US-12.
- UF-05, UF-06, UF-07, UF-08.

## Tests

- `application/credit-management.store.spec.ts`:
  - `simulate()` guarda el `PaymentPlan` y limpia error; con fallo
    expone el mensaje y NO setea `simulation()`.
  - `register()` exitoso agrega venta y descarta simulación previa;
    fallido conserva la simulación para reintentar.
  - `clearSimulation()` descarta el plan simulado.
  - `approveRequest()` / `rejectRequest()` reemplazan la solicitud en
    el signal y reject pasa el motivo al endpoint.

## Notas

- El store-dashboard depende de `BillingStore` (dependencia conocida
  entre BCs; el dashboard es una vista agregada de lectura).
- Pendiente #2: abrir detalle de venta con `payment-plan` real.
