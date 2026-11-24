# User Flow — Frontend Web

Flujos de navegación identificados con ID (`UF-XX`), para poder
referenciarlos desde `state/estado-frontend-<bc>.md` o desde la
sustentación sin tener que describirlos de nuevo. Cada uno linkea a la
user story que cubre (`docs/user-stories.md`).

---

## UF-01 — Login y enrutamiento por rol

- **US relacionada:** (previa a todas)
- **Entrada:** `/login`
- **Pasos:**
  1. Usuario ingresa correo + contraseña → `POST /api/v1/authentication/sign-in`.
  2. Si falla → mensaje de error, se queda en `/login`.
  3. Si OK → `authGuard` deja pasar a `/app`.
  4. Según el rol del JWT:
    - `SYSTEM_ADMIN` → redirige a `/app/system/stores`.
    - `STORE_ADMIN` → redirige a `/app/store/dashboard`.
    - `CLIENT` → no tiene landing en este frontend (es de la app mobile).
- **Guards:** `authGuard` (sesión), `roleGuard` (rama por rol).
- **Reglas:** no hay pantalla intermedia de "elegir qué hacer" — el
  aterrizaje es automático según rol.

## UF-02 — Admin Sistema: gestión de tiendas

- **US relacionada:** US-13
- **Entrada:** `/app/system/stores` (landing de `SYSTEM_ADMIN`)
- **Pasos:**
  1. Ver listado de tiendas.
  2. "Nueva tienda" → `store-form` (modo crear) → guarda → vuelve al
     listado.
  3. Click en una tienda → `store-form` (modo editar) → guarda o
     activa/desactiva.
- **Guard:** `roleGuard([SYSTEM_ADMIN])` en el nodo `system`.

## UF-03 — Admin Sistema: gestión de usuarios

- **US relacionada:** US-14
- **Entrada:** `/app/system/users`
- **Pasos:**
  1. Ver listado de usuarios.
  2. "Nuevo usuario" → `user-form` → elige rol → si es `STORE_ADMIN`,
     selecciona tienda(s) → guarda.
- **Depende de:** UF-02 (la tienda debe existir y estar activa antes de
  poder vincularla aquí).

## UF-04 — Admin Sistema: bitácora de operaciones

- **US relacionada:** US-16
- **Entrada:** `/app/system/operation-logs`
- **Pasos:**
  1. Ver listado paginado.
  2. Aplicar filtros (usuario, acción, entidad, rango de fechas) —
     combinables entre sí.
- **Reglas:** flujo de solo lectura, sin salidas hacia otras vistas.

## UF-05 — Admin Tienda: dashboard

- **US relacionada:** US-01
- **Entrada:** `/app/store/dashboard` (landing de `STORE_ADMIN`)
- **Pasos:**
  1. Ver KPIs + gráfico de cobranza + vencimientos próximos.
  2. (Punto de entrada natural hacia UF-10, "ver cuotas por vencer".)

## UF-06 — Admin Tienda: clientes y condiciones de crédito

- **US relacionada:** US-04
- **Entrada:** `/app/store/credit-profiles`
- **Pasos:**
  1. Ver listado de perfiles crediticios.
  2. "Nuevo"/editar → `credit-profile-form` (tasa, límite, plazo, día
     de corte, día de pago, tasa moratoria) → guarda.
- **Depende de:** el cliente (usuario rol `CLIENT`) ya debe existir —
  se crea desde UF-03, pero con rol `CLIENT`.

## UF-07 — Admin Tienda: registrar venta a crédito

- **US relacionada:** US-02
- **Entrada:** `/app/store/credit-sales/new`
- **Pasos:**
  1. Seleccionar cliente (con perfil activo).
  2. Agregar productos del catálogo (UF-09 debe tener productos ya
     cargados).
  3. Elegir modalidad (pago único / cuotas método francés) + plazo +
     gracia.
  4. Simular (vista previa del plan) — `POST .../credit-sale-simulations`.
  5. Confirmar — `POST .../credit-sales` → genera cronograma.
- **Reglas:** no avanza del paso 4 si la simulación indica que excede
  el crédito disponible.

## UF-08 — Admin Tienda: revisar solicitudes de compra

- **US relacionada:** US-12
- **Entrada:** `/app/store/purchase-requests`
- **Pasos:**
  1. Ver bandeja de solicitudes `PENDING`.
  2. Aprobar → genera venta automáticamente (sin repetir UF-07).
  3. Rechazar → motivo obligatorio.
- **Origen:** la solicitud la crea el cliente desde la app mobile
  (US-08, fuera de este repo).

## UF-09 — Admin Tienda: catálogo de productos

- **US relacionada:** US-11
- **Entrada:** `/app/store/products`
- **Pasos:**
  1. Ver listado.
  2. "Nuevo"/editar → `product-form` (incluye subida de imagen a
     Cloudinary) → guarda.
- **Alimenta a:** UF-07 (los productos activos son los que aparecen al
  armar una venta).

## UF-10 — Admin Tienda: cobranza y pagos

- **US relacionada:** US-05
- **Entrada:** `/app/store/payments`
- **Pasos:**
  1. Ver vencimientos del día.
  2. Seleccionar cliente/cuota → `register-payment` → ver desglose
     (mora → interés → capital) → confirmar pago íntegro.
- **Reglas:** sin campo de monto editable (ver `docs/user-stories.md`
  US-05).

## UF-11 — Admin Tienda: estados de cuenta

- **US relacionada:** US-06
- **Entrada:** `/app/store/account-statements`
- **Pasos:**
  1. Ver listado por cliente.
  2. Click en uno → ver detalle del corte.
- **Reglas:** flujo de solo lectura — la generación es un job del
  backend, no una acción de este flujo.
