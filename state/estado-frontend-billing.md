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

## Application

- `billing.store.ts` — signals de cuotas por vencer, desglose
  exigible actual y estados de cuenta. Garantiza en UI que la
  confirmación de pago nunca lleva un monto — solo los
  `installmentIds` seleccionados.

## Presentation

- `views/installments-due` — US-05 (UF-10), listado del día.
- `views/register-payment` — US-05 (UF-10), confirmación con
  desglose; sin campo de monto.
- `views/account-statements-list` — US-06 (UF-11), solo lectura.

## Rutas que aporta

- `app/store/payments`.
- `app/store/payments/register`.
- `app/store/account-statements`.

## US / UF cubiertos

- US-05 — Registrar pagos y revisar mora (UF-10).
- US-06 — Estados de cuenta al corte (UF-11, solo lectura).

## Notas

- Pendiente #4: los triggers manuales de `BillingScheduler`
  (`overdue-sweep`, `account-statements`) todavía no tienen vista —
  hoy se disparan con curl/Postman.
- `credit-management/store-dashboard` consume este store para KPIs
  (dependencia inversa conocida).
