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
  `GET /credit-sales/{id}/payment-plan` (**pendiente #2 resuelto**: ya
  se consume desde la vista `credit-sale-detail`).
- `purchase-requests-api-endpoint.ts` — listado por tienda,
  `POST .../approval`, `POST .../rejection` (motivo obligatorio).

## Application

- `credit-management.store.ts` — signals de perfiles, ventas,
  solicitudes y último cronograma simulado. Orquesta "simular antes
  de registrar": no permite confirmar venta si la simulación devolvió
  que excede crédito disponible.
  - **Pendiente #2:** `selectedSale` + `selectedSalePlan`,
    `loadSale(id)` y `loadPaymentPlan(id)` para alimentar la vista
    de detalle; `clearSelectedSale()` al desmontar.

## Presentation

- `views/store-dashboard` — US-01 (UF-05), KPIs + gráfico; consume
  también `billing.store` para mora/vencimientos.
- `views/credit-profiles-list` + `credit-profile-form` — US-04
  (UF-06).
- `views/credit-sales-list` — US-02 vista histórica; enlaza al
  detalle en `credit-sales/:id`.
- `views/credit-sale-detail` — **pendiente #2 resuelto**: cronograma
  real fusionando `payment-plan` (snapshot) con `billing.saleInstallments`
  (estado actual por cuota). Muestra el snapshot de tasas.
- `views/credit-sale-wizard` — US-02 (UF-07), stepper: cliente →
  productos → modalidad/plazo → simular → confirmar.
- `views/purchase-requests-inbox` — US-12 (UF-08); aprobar genera la
  venta automáticamente en backend (sin segundo request).

## Rutas que aporta

- `app/store/dashboard` — landing del `STORE_ADMIN`.
- `app/store/credit-profiles`, `/new`, `/:id/edit`.
- `app/store/credit-sales`, `/new` (wizard), `/app/store/credit-sales/:id` (detalle).
- `app/store/purchase-requests`.
- Reapunta `app/store` → `dashboard` (antes `products`).

## US / UF cubiertos

- US-01, US-02, US-04, US-07 (panel web, resuelto en #2), US-12.
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
  - **Pendiente #2:** `loadSale` guarda la venta y resetea plan previo;
    `loadPaymentPlan` guarda el cronograma; `clearSelectedSale` limpia
    ambos.
- `infrastructure/credit-sales-api-endpoint.spec.ts` — verifica URLs y
  payload exactos de `simulate`, `register`, `get` y `paymentPlan`.

## Notas

- El store-dashboard depende de `BillingStore` (dependencia conocida
  entre BCs; el dashboard es una vista agregada de lectura).
- Pendiente #2 (detalle de venta con `payment-plan`) resuelto.
