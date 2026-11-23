# User Flow — Frontend Web

Flujo de navegación por rol. Para el detalle técnico de guards/rutas ver
`docs/guia-arquitectura-frontend-ddd.md` sección 7; esto es la vista de
alto nivel pensada para sustentación.

## Entrada común

```
Login (/login)
   │  POST /api/v1/authentication/sign-in
   ▼
¿Login OK?
   │ No → mensaje de error, se queda en /login
   │ Sí
   ▼
authGuard deja pasar a /app
   │
   ▼
Según rol del usuario autenticado → redirige al landing de su rol
```

- `roleGuard` protege cada rama (`/app/system/*`, `/app/store/*`) — un
  usuario sin el rol correcto nunca llega a ver esa rama, ni por URL
  directa.
- Un usuario con rol `CLIENT` no tiene landing en este frontend: el
  backend lo rechaza o, si se intenta, la app lo redirige a usar la
  mobile.

## Flujo — Admin Sistema (`SYSTEM_ADMIN`)

```
/app/system  (landing → redirige a "stores")
   │
   ├─► Tiendas (stores)
   │      ├─ ver listado
   │      ├─ nueva tienda ───► formulario ───► guarda ───► vuelve al listado
   │      └─ editar/activar-desactivar tienda existente
   │
   ├─► Usuarios (users)
   │      ├─ ver listado
   │      └─ nuevo usuario ───► formulario (rol, y tienda si es STORE_ADMIN) ───► guarda
   │
   └─► Bitácora (operation-logs)
          └─ listado filtrable (usuario, acción, entidad, rango de fechas) — solo lectura
```

## Flujo — Admin Tienda (`STORE_ADMIN`)

```
/app/store  (landing → redirige a "dashboard")
   │
   ├─► Dashboard
   │      KPIs de cobranza, mora, gráfico, vencimientos próximos
   │      └─ (punto de entrada natural hacia "Cuotas por vencer")
   │
   ├─► Clientes / condiciones (credit-profiles)
   │      ├─ ver listado
   │      └─ nuevo / editar perfil ───► condiciones (tasa, límite, plazo, corte, pago)
   │
   ├─► Ventas al crédito (credit-sales)
   │      ├─ ver listado
   │      └─ nueva venta ───► wizard:
   │             seleccionar cliente → agregar productos → elegir modalidad
   │             → vista previa (simulación) → confirmar → genera cronograma
   │
   ├─► Solicitudes de compra (purchase-requests)
   │      └─ bandeja pendientes ───► aprobar (genera venta) | rechazar (motivo obligatorio)
   │
   ├─► Catálogo (products)
   │      ├─ ver listado
   │      └─ nuevo / editar producto (con imagen Cloudinary)
   │
   ├─► Cuotas por vencer (payments)
   │      └─ ver vencimientos ───► registrar pago ───► desglose (mora→interés→capital) → confirmar
   │
   └─► Estados de cuenta (account-statements)
          └─ listado por cliente ───► detalle del corte
```

## Reglas de flujo que no son solo "navegación"

- **Elegibilidad antes de vender:** aunque la validación dura la hace el
  backend, el wizard de venta (US-02) no deja avanzar al paso de
  confirmación si la simulación devuelve que el monto excede el crédito
  disponible.
- **Sin pagos parciales:** `register-payment` no tiene campo de "monto a
  pagar" — solo confirma el total exigible que ya calculó el backend.
- **Aprobar solicitud = crear venta:** no hay un paso intermedio; al
  aprobar una solicitud de compra, el flujo termina ahí (la venta se
  genera sola, no hay que repetir el wizard).
