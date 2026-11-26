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
  - **Pendiente #3 resuelto:** nueva `uploadImageWithProgress()` con
    `reportProgress: true, observe: 'events'` que emite `UploadEvent`
    con `{kind, progress, product, done}` por cada chunk subido.
- `catalog-apis.ts` — `GET /currencies`, `GET /measurement-units`.

## Application

- `store-management.store.ts` — signals para tiendas, productos,
  monedas, unidades, con `loadStores()`, `createStore()`,
  `loadProducts(storeId)`, `uploadProductImage()`.
  - **Pendiente #3:** expone `uploadProgress` y `uploadError`; el
    método `uploadImage` suscribe al stream de `UploadEvent` y
    actualiza el porcentaje en tiempo real.

## Presentation

- `views/stores-list` — US-13, `/app/system/stores`.
- `views/store-form` — US-13, `/app/system/stores/new` y
  `/app/system/stores/:id/edit`.
- `views/products-list` — US-11, `/app/store/products`.
- `views/product-form` — US-11, `/app/store/products/new` y
  `/app/store/products/:id/edit`. **Pendiente #3:** barra de progreso
  en vivo (`mat-progress-bar`), banner de error del backend y bloqueo
  local cuando el archivo pasa de 5 MB.

## Rutas que aporta

- `app/system/stores`, `stores/new`, `stores/:id/edit`.
- Nuevo nodo `app/store` con `roleGuard([StoreAdmin])` y hijos
  `products`, `products/new`, `products/:id/edit`.
- Reapunta `app` → `store/dashboard` y `system` → `stores`.

## US / UF cubiertos

- US-13 — Administrar comercios (UF-02).
- US-11 — Mantener catálogo (UF-09).

## Tests

- `application/store-management.store.spec.ts` — `loadStores` happy
  path + error, `createStore` agrega al final, `updateStore` reemplaza
  por id, `toggleStoreStatus` propaga `active`, y `loadProductsByStore`
  pasa el `storeId` correcto al endpoint.
  - **Pendiente #3:** `uploadImage` refleja el progreso del endpoint
    en `uploadProgress()`; con error limpia el progreso y guarda el
    mensaje; `clearUploadState()` reinicia ambos a `null`.

## Notas

- Pendiente #3 (subida con progreso/error) resuelto en esta iteración.
