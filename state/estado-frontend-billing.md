# Estado — Billing

Cuotas por vencer, registro de pagos (sin pagos parciales) y estados
de cuenta mensuales.

## Domain

- `Installment` — cuota generada en el cronograma de una venta, con
  `InstallmentStatus` (pendiente/pagada/vencida).
- `PaymentDue` — desglose exigible devuelto por el backend:
  `{ capital, interes, mora, total }`. Sin campo editable.
- `Payment` — pago registrado con sus `allocations` (imputación
  mora → interés → capital).
- `AccountStatement` — snapshot mensual al corte: saldo anterior,
  compras, pagos, intereses, mora, saldo final.

## Infrastructure

- `installments-api-endpoint.ts` — `GET /stores/{id}/installments-due`.
- `payments-api-endpoint.ts` — `GET /credit-profiles/{id}/payment-due?installmentIds=`
  (calcula desglose) y `POST /credit-profiles/{id}/payments`
  (**sin monto** en el request).
- `account-statements-api-endpoint.ts` — listado por perfil y detalle.
- **Pendiente #4 resuelto:** `billing-jobs-api-endpoint.ts` con
  `runOverdueSweep(asOf?)` y `runAccountStatements(asOf?)` → `POST` a
  `/api/v1/admin/billing/jobs/{overdue-sweep,account-statements}`.

## Application

- `billing.store.ts` — signals de cuotas por vencer, desglose
  exigible actual y estados de cuenta. Garantiza en UI que la
  confirmación de pago nunca lleva un monto — solo los
  `installmentIds` seleccionados.
  - **Pendiente #4:** expone `jobRunning` y `jobMessage`;
    `runOverdueSweep()` y `runAccountStatements()` orquestan los
    triggers y reportan el resultado al UI.

## Presentation

- `views/installments-due` — US-05 (UF-10), listado del día.
- `views/register-payment` — US-05 (UF-10), confirmación con
  desglose; sin campo de monto.
- `views/account-statements-list` — US-06 (UF-11), solo lectura.
- **Pendiente #4 resuelto:** `views/billing-jobs` en
  `/app/system/billing-jobs` (solo `SYSTEM_ADMIN`) — dispara los dos
  jobs con una fecha `asOf` opcional, muestra estado `running` y
  banner de éxito/error.

## Rutas que aporta

- `app/store/payments`.
- `app/store/payments/register`.
- `app/store/account-statements`.
- `app/system/billing-jobs` (pendiente #4).

## US / UF cubiertos

- US-05 — Registrar pagos y revisar mora (UF-10).
- US-06 — Estados de cuenta al corte (UF-11, solo lectura).

## Tests

- `application/billing.store.spec.ts`:
  - `loadPaymentDue` con `[]` limpia el `due` sin llamar al endpoint;
    con ids guarda el desglose.
  - `registerPayment` happy path (agrega pago, limpia due, apaga
    loading) y error (conserva due, expone mensaje).
  - **Regla crítica US-05:** test dedicado a `PaymentsApiEndpoint.register`
    verifica que el body POST solo lleva `installmentIds` — nunca
    `amount`, `monto` ni `total`.
  - **Pendiente #4:** `runOverdueSweep` publica mensaje de éxito y
    libera el lock de job; `runAccountStatements` propaga error al
    signal `error`; ambos pasan `asOf` (o `undefined`) al endpoint.
- `infrastructure/installments-api-endpoint.spec.ts` — URLs de
  `listBySale`, `listDueByStore` y `paymentDue`; este último además
  verifica que `installmentIds` va como CSV en query param.
- `infrastructure/billing-jobs-api-endpoint.spec.ts` — URLs y
  parámetro `asOf` opcional para los dos triggers.

## Notas

- Pendiente #4 (triggers del scheduler) resuelto en esta iteración.
- `credit-management/store-dashboard` consume este store para KPIs
  (dependencia inversa conocida).
