# Estado — IAM

Autenticación, sesión y gestión de usuarios/roles.

## Domain

- `User`, `Role`, `AuthenticatedUser` (el usuario tras `sign-in`,
  incluye `token` y `storeIds`).

## Infrastructure

- `authentication-api.ts` — `POST /authentication/sign-in` y
  `GET /users/me` (hidratación de sesión).
- `users-api-endpoint.ts` — CRUD + `PATCH .../status` + vínculo con
  tiendas.
- `roles-api-endpoint.ts` — `GET /roles` (combo).
- `auth-storage.ts` — clave `AUTH_TOKEN_KEY` y acceso a
  `localStorage`.
- `auth-token.interceptor.ts` — adjunta `Authorization: Bearer <token>`
  a cada request saliente; registrado en `app.config.ts` vía
  `provideHttpClient(withInterceptors([authTokenInterceptor]))`.

## Application

- `auth.store.ts` — signals de sesión (`currentUser`, `isAuthenticated`,
  `role`), `login()`, `logout()`, `hydrate()`.
  - **Pendiente #1 resuelto:** ahora expone `activeStoreId` writable
    (no es un `storeIds[0]` fijo), `availableStoreIds`,
    `hasMultipleStores` y `setActiveStore(id)`. Se persiste con
    `ACTIVE_STORE_KEY` para sobrevivir recargas; si la guardada deja
    de estar vinculada, cae a la primera disponible.
- `iam.store.ts` — listado/CRUD de usuarios y catálogo de roles para
  el panel `SYSTEM_ADMIN`.

## Presentation

- `views/login` — US-14 pre-condición / UF-01.
- `views/users-list` — US-14, ruta `/app/system/users`, guard
  `roleGuard([SystemAdmin])`.
- `views/user-form` — US-14, rutas `/app/system/users/new` y
  (pendiente de registrar) `/app/system/users/:id/edit`.

## Rutas que aporta

- `''` → redirige a `login`.
- `login` → `LoginComponent`.
- `app` → `AppShellComponent` protegido por `authGuard`, con
  redirect por defecto hacia `system/users` (se reapunta a
  `store/dashboard` cuando aterrice `credit-management`).
- `app/system` → subgrupo con `roleGuard([SystemAdmin])` + hijos
  `users`, `users/new`.
- `**` → `login`.

## US / UF cubiertos

- US-14 — Administrar usuarios y roles.
- UF-01 — Login y enrutamiento por rol.
- UF-03 — Admin Sistema: gestión de usuarios.

## Tests

- `application/auth.store.spec.ts` — hidratación desde `localStorage`,
  `signIn` exitoso (token guardado + navegación por rol), `signIn`
  fallido (sin navegar, error expuesto), `signOut` limpia storage, y
  tabla de `landingFor()` para los 3 roles.
  - **Pendiente #1:** `activeStoreId` arranca en `storeIds[0]`,
    `setActiveStore()` cambia y persiste, rechaza una tienda ajena,
    rehidrata la guardada si sigue válida, cae a la primera si ya no
    está vinculada; `hasMultipleStores()` responde al conteo.
- `infrastructure/auth-token.interceptor.spec.ts` — agrega
  `Authorization: Bearer <token>` cuando hay token, no toca el header
  si no hay token, y respeta `Authorization` si ya venía seteado.
- `infrastructure/authentication-api.spec.ts` — mapeo de `signIn`:
  `fullName` del backend, fallback por `firstName + lastName`, y
  último fallback por `email` (regresión del bug `??` / `||`).

## Notas

- Shared importa `AUTH_TOKEN_KEY` y `AuthStore` de iam (dependencia
  conocida, ver `estado-frontend-shared.md`).
