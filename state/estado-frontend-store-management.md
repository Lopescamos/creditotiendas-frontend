# Estado — Store Management

Tiendas (admin `SYSTEM_ADMIN`) y catálogo de productos (admin
`STORE_ADMIN`).

## Domain

- `Store` — tienda con RUC, razón social, nombre comercial, dirección,
  teléfono, `active`.
- `Product` — producto/servicio del catálogo con `measurementUnitId`,
  `precioContado`, `precioCredito`, `tipo`, `imageUrl`.
- `Currency`, `MeasurementUnit` — catálogos auxiliares para los combos.

## Infrastructure

- `stores-api-endpoint.ts` — `GET/POST /stores`, `GET|PUT /stores/{id}`,
  `PATCH /stores/{id}/status`.
- `products-api-endpoint.ts` — `GET/POST /stores/{id}/products`,
  `GET|PUT /products/{id}`, `PATCH /products/{id}/status`, upload de
  imagen a Cloudinary (`POST /products/{id}/image`).
- `catalog-apis.ts` — `GET /currencies`, `GET /measurement-units`.

## Application

- `store-management.store.ts` — signals para tiendas, productos,
  monedas, unidades, con `loadStores()`, `createStore()`,
  `loadProducts(storeId)`, `uploadProductImage()`.

## Presentation

- `views/stores-list` — US-13, `/app/system/stores`.
- `views/store-form` — US-13, `/app/system/stores/new` y
  `/app/system/stores/:id/edit`.
- `views/products-list` — US-11, `/app/store/products`.
- `views/product-form` — US-11, `/app/store/products/new` y
  `/app/store/products/:id/edit`.

## Rutas que aporta

- `app/system/stores`, `stores/new`, `stores/:id/edit`.
- Nuevo nodo `app/store` con `roleGuard([StoreAdmin])` y hijos
  `products`, `products/new`, `products/:id/edit`.
- Reapunta `app` → `store/dashboard` y `system` → `stores`.

## US / UF cubiertos

- US-13 — Administrar comercios (UF-02).
- US-11 — Mantener catálogo (UF-09).

## Notas

- La subida de imagen aún no tiene progreso ni manejo explícito de
  errores de red — pendiente #3 en `state/pendientes.md`.
