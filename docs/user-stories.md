# User Stories cubiertas por este frontend

Detalle completo de las 10 user stories que este frontend web implementa
(SYSTEM_ADMIN / STORE_ADMIN). Las de `CLIENT` (US-03, 07, 08, 09, 10, 15)
se cubren en la app mobile — acá solo quedan listadas al final, sin
detalle, para que quede claro que existen y por qué no están aquí.

Este archivo es autocontenido: no depende de tener el repo del backend
abierto para saber qué significa cada US.

---

## Resumen

| US | Historia | Vista | Estado |
|---|---|---|---|
| US-13 | Administrar comercios | `system/stores-list`, `system/store-form` | ✅ |
| US-14 | Administrar usuarios y roles | `system/users-list`, `system/user-form` | ✅ |
| US-16 | Consultar bitácora de operaciones | `system/operation-logs` | ✅ |
| US-01 | Resumen del comercio (dashboard) | `store/store-dashboard` | ✅ |
| US-02 | Registrar venta a crédito | `store/credit-sale-wizard` | ✅ |
| US-04 | Gestionar clientes y condiciones | `store/credit-profiles-list`, `store/credit-profile-form` | ✅ |
| US-05 | Registrar pagos y revisar mora | `store/installments-due`, `store/register-payment` | ✅ |
| US-06 | Generar estado de cuenta al corte | `store/account-statements-list` | ✅ (solo lectura) |
| US-11 | Mantener catálogo | `store/products-list`, `store/product-form` | ✅ |
| US-12 | Revisar solicitudes de compra a crédito | `store/purchase-requests-inbox` | ✅ |

---

## Admin Sistema

### US-13 — Administrar comercios
**BC:** Store Management · **Vista:** `system/stores-list`, `system/store-form`

- **Pre-condición:** usuario autenticado con rol `SYSTEM_ADMIN`.
- **Flujo:** alta de tienda con RUC, razón social, nombre comercial,
  dirección, teléfono. Activar/desactivar tiendas existentes.
- **Criterios de aceptación:**
  - RUC único (11 dígitos) — el formulario debe mostrar el 422 del
    backend si está duplicado, no validarlo solo en frontend.
  - Una tienda desactivada no puede recibir nuevas ventas ni nuevos
    usuarios vinculados (el backend lo bloquea; el frontend deshabilita
    las acciones correspondientes en la UI cuando `active: false`).
  - El alta de tienda **no** crea automáticamente un `STORE_ADMIN` — eso
    es US-14, un paso separado.

### US-14 — Administrar usuarios y roles
**BC:** IAM · **Vista:** `system/users-list`, `system/user-form`

- **Pre-condición:** usuario autenticado con rol `SYSTEM_ADMIN`; para
  vincular a tienda, la tienda debe existir y estar activa (US-13).
- **Flujo:** crear usuario con correo, nombre, apellido, contraseña.
  Asignar rol (`STORE_ADMIN` o `CLIENT`). Si el rol es `STORE_ADMIN`,
  vincular a una o más tiendas.
- **Criterios de aceptación:**
  - Correo único — mostrar el 422 del backend tal cual si está repetido.
  - La contraseña nunca se muestra de vuelta (ni en edición); el campo
    de password en `user-form` solo existe en modo "crear" o "resetear".
  - Un usuario con rol `CLIENT` no requiere vínculo a tienda al crearse
    desde este panel — su perfil crediticio por tienda se crea después
    (US-04), no desde `user-form`.

### US-16 — Consultar bitácora de operaciones
**BC:** Audit · **Vista:** `system/operation-logs`

- **Pre-condición:** usuario autenticado con rol `SYSTEM_ADMIN`.
- **Flujo:** listado filtrable (usuario, acción, entidad, rango de
  fechas), solo lectura.
- **Criterios de aceptación:**
  - Es una vista 100% de solo lectura — no debe existir ningún botón de
    crear/editar/borrar en esta pantalla, ni siquiera deshabilitado.
  - Los filtros son opcionales y combinables (se pueden aplicar varios
    a la vez).

---

## Admin Tienda

### US-01 — Resumen del comercio (dashboard)
**BC:** lectura agregada de Credit Management + Billing · **Vista:** `store/store-dashboard`

- **Pre-condición:** usuario autenticado con rol `STORE_ADMIN`,
  vinculado a la tienda consultada.
- **Flujo:** KPIs (total por cobrar, cobrado este mes, monto en mora),
  gráfico de cobranza, vencimientos próximos, movimientos recientes.
- **Criterios de aceptación:**
  - Todo lo que se muestra ya viene filtrado por tienda desde el
    backend — el frontend no debe mezclar datos de más de una tienda
    aunque el usuario esté vinculado a varias (ver pendiente del
    selector multi-tienda).
  - "Monto en mora" es al día de hoy, no un acumulado histórico.

### US-02 — Registrar venta a crédito
**BC:** Credit Management · **Vista:** `store/credit-sale-wizard`

- **Pre-condición:** cliente con perfil crediticio activo en la tienda;
  productos existentes en catálogo.
- **Flujo:** wizard — seleccionar cliente → agregar productos del
  catálogo → elegir modalidad (pago único fin de mes o cuotas método
  francés) → definir plazo y gracia → vista previa del plan (simulación)
  → confirmar.
- **Criterios de aceptación:**
  - El wizard **no deja avanzar** al paso de confirmación si la
    simulación devuelve que el monto excede el crédito disponible —
    aunque la validación dura la haga el backend, la UI no debe dejar
    insistir sin mostrar el motivo.
  - Tras confirmar, el cronograma se genera solo (el frontend no arma
    ningún cálculo de cuotas, solo muestra lo que devuelve el backend).
  - La venta queda con un snapshot de tasas — editar el perfil del
    cliente después no cambia esta venta (ver US-04).

### US-04 — Gestionar clientes y condiciones
**BC:** Credit Management · **Vista:** `store/credit-profiles-list`, `store/credit-profile-form`

- **Pre-condición:** usuario `STORE_ADMIN` autenticado; cliente
  registrado presencialmente la primera vez.
- **Flujo:** alta/baja/edición de condiciones pactadas — tasa (nominal o
  efectiva), moneda, límite de crédito, plazo máximo, día de corte, día
  de pago, tasa moratoria.
- **Criterios de aceptación:**
  - Editar condiciones de un perfil **no** modifica ventas ya
    registradas (snapshot, ver US-02) — el formulario no debe dar a
    entender que "esto afecta retroactivamente".
  - Tasas con mínimo 7 decimales, montos con 2 — cuidar el formato en
    los inputs numéricos para no truncar precisión.

### US-05 — Registrar pagos y revisar mora
**BC:** Billing · **Vista:** `store/installments-due`, `store/register-payment`

- **Pre-condición:** cliente con cuotas pendientes.
- **Flujo:** ver vencimientos pendientes del día, desglose exigible
  (capital + interés + mora), registrar pago íntegro.
- **Criterios de aceptación:**
  - **No existe campo de "monto a pagar"** — el monto lo calcula y
    confirma el backend, el frontend solo muestra el desglose y pide
    confirmación.
  - La imputación del pago (mora → interés → capital) se muestra tal
    cual la devuelve el backend, no se recalcula en frontend.

### US-06 — Generar estado de cuenta al corte
**BC:** Billing · **Vista:** `store/account-statements-list`

- **Pre-condición:** ha llegado el día de corte configurado en el
  perfil del cliente.
- **Flujo:** listado de snapshots mensuales — saldo anterior, compras
  del período, pagos, intereses, mora, saldo final.
- **Criterios de aceptación:**
  - Vista 100% de solo lectura — la generación es automática en el
    backend (job programado), el frontend nunca dispara la generación
    desde aquí (eso es el pendiente #4, una pantalla aparte para
    `SYSTEM_ADMIN`).
  - Un estado de cuenta ya generado no se recalcula — no mostrar un
    botón de "actualizar" sobre uno existente.

### US-11 — Mantener catálogo
**BC:** Store Management · **Vista:** `store/products-list`, `store/product-form`

- **Pre-condición:** usuario `STORE_ADMIN` autenticado.
- **Flujo:** CRUD de productos/servicios — descripción, proveedor,
  marca, unidad, imagen (Cloudinary), precio contado, precio crédito,
  tipo.
- **Criterios de aceptación:**
  - Sin manejo de inventario ni stock — no agregar un campo de
    "cantidad disponible", no corresponde a este modelo.
  - Un producto desactivado se sigue mostrando en el historial de
    ventas ya hechas, pero no debe aparecer como opción al armar una
    venta nueva (US-02).

### US-12 — Revisar solicitudes de compra a crédito
**BC:** Credit Management · **Vista:** `store/purchase-requests-inbox`

- **Pre-condición:** existe al menos una solicitud en estado
  `PENDING`.
- **Flujo:** bandeja de solicitudes recibidas, aprobar (genera venta
  automáticamente) o rechazar con motivo.
- **Criterios de aceptación:**
  - Al aprobar, **no hay un paso intermedio** — la venta se genera sola
    en el backend; el frontend no repite el wizard de US-02.
  - Al rechazar, el motivo es un campo obligatorio en el formulario
    (el backend lo exige, pero la UI debe validarlo también para no
    hacer un viaje al servidor en vano).

---

## Nota sobre US-07 vista desde el panel web

El Admin Tienda hoy **no** tiene una vista propia del cronograma de
cuotas de una venta puntual (eso lo ve el cliente en su app mobile). Es
el pendiente #2 de `state/pendientes.md` — el endpoint ya existe
(`GET /api/v1/credit-sales/{id}/payment-plan`), solo falta la vista.

## Fuera del alcance de este frontend (app mobile — otro repo)

| US | Historia |
|---|---|
| US-03 | Consultar mi cuenta |
| US-07 | Consultar plan de cuotas |
| US-08 | Solicitar compra a crédito |
| US-09 | Consultar estado de solicitud |
| US-10 | Pagar cuenta |
| US-15 | Ayuda financiera |
