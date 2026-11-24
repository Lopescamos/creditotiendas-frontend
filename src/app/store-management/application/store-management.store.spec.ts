import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { StoreManagementStore } from './store-management.store';
import { StoresApiEndpoint } from '../infrastructure/stores-api-endpoint';
import { ProductsApiEndpoint } from '../infrastructure/products-api-endpoint';
import { Store } from '../domain/model/store.entity';

const anHttp = {} as HttpClient;

function newStore(partial: Partial<Store> = {}): Store {
  return new Store(
    partial.id ?? 1,
    partial.ruc ?? '20123456789',
    partial.razonSocial ?? 'Mi tienda SAC',
    partial.nombreComercial ?? 'Mi Tienda',
    partial.direccion ?? 'Av. Siempre Viva 123',
    partial.telefono ?? '999',
    partial.active ?? true,
  );
}

describe('StoreManagementStore', () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StoreManagementStore,
        { provide: HttpClient, useValue: anHttp },
      ],
    });
  });

  it('loadStores populariza stores() y apaga loading', () => {
    const data = [newStore({ id: 1 }), newStore({ id: 2 })];
    vi.spyOn(StoresApiEndpoint.prototype, 'getAll').mockReturnValue(of(data));

    const store = TestBed.inject(StoreManagementStore);
    store.loadStores();

    expect(store.stores()).toEqual(data);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('loadStores con fallo expone error y apaga loading', () => {
    vi.spyOn(StoresApiEndpoint.prototype, 'getAll').mockReturnValue(
      throwError(() => new Error('GET all: sin permiso')),
    );
    const store = TestBed.inject(StoreManagementStore);
    store.loadStores();

    expect(store.error()).toBe('GET all: sin permiso');
    expect(store.loading()).toBe(false);
  });

  it('createStore agrega el resultado al final del listado existente', () => {
    const existente = newStore({ id: 1 });
    const nuevo = newStore({ id: 2, razonSocial: 'Nueva' });
    vi.spyOn(StoresApiEndpoint.prototype, 'getAll').mockReturnValue(of([existente]));
    vi.spyOn(StoresApiEndpoint.prototype, 'create').mockReturnValue(of(nuevo));

    const store = TestBed.inject(StoreManagementStore);
    store.loadStores();
    store.createStore(nuevo);

    expect(store.stores().map((s) => s.id)).toEqual([1, 2]);
  });

  it('updateStore reemplaza el elemento con mismo id en el listado', () => {
    const original = newStore({ id: 1, razonSocial: 'Vieja' });
    const editado = newStore({ id: 1, razonSocial: 'Editada' });
    vi.spyOn(StoresApiEndpoint.prototype, 'getAll').mockReturnValue(of([original]));
    vi.spyOn(StoresApiEndpoint.prototype, 'update').mockReturnValue(of(editado));

    const store = TestBed.inject(StoreManagementStore);
    store.loadStores();
    store.updateStore(editado);

    expect(store.stores()).toEqual([editado]);
  });

  it('toggleStoreStatus propaga el active actualizado al signal', () => {
    const activa = newStore({ id: 1, active: true });
    const inactiva = newStore({ id: 1, active: false });
    vi.spyOn(StoresApiEndpoint.prototype, 'getAll').mockReturnValue(of([activa]));
    vi.spyOn(StoresApiEndpoint.prototype, 'updateStatus').mockReturnValue(of(inactiva));

    const store = TestBed.inject(StoreManagementStore);
    store.loadStores();
    store.toggleStoreStatus(1, false);

    expect(store.stores()[0].active).toBe(false);
  });

  it('loadProductsByStore llama al endpoint con el storeId correcto', () => {
    const spy = vi.spyOn(ProductsApiEndpoint.prototype, 'listByStore').mockReturnValue(of([]));
    const store = TestBed.inject(StoreManagementStore);
    store.loadProductsByStore(42);
    expect(spy).toHaveBeenCalledWith(42);
  });
});

describe('StoreManagementStore - pendiente #3: upload con progreso', () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StoreManagementStore,
        { provide: HttpClient, useValue: anHttp },
      ],
    });
  });

  it('uploadImage() refleja el progreso del endpoint en uploadProgress()', () => {
    const progressValues: Array<number | null> = [];
    vi.spyOn(ProductsApiEndpoint.prototype, 'uploadImageWithProgress').mockReturnValue(
      of(
        { kind: 'progress' as const, progress: 25, product: null, done: false },
        { kind: 'progress' as const, progress: 75, product: null, done: false },
        { kind: 'done'     as const, progress: 100, product: null, done: true },
      ),
    );
    const store = TestBed.inject(StoreManagementStore);
    // Suscribirse a los cambios via sampling con effect seria mas elegante,
    // pero basta con comprobar el estado final: el ultimo valor publicado es 100.
    store.uploadImage(5, new File(['x'], 'x.png'));
    expect(store.uploadProgress()).toBe(100);
    expect(store.uploadError()).toBeNull();
    progressValues.push(store.uploadProgress());  // sanity
    expect(progressValues).toContain(100);
  });

  it('uploadImage() con error limpia el progreso y guarda el mensaje', () => {
    vi.spyOn(ProductsApiEndpoint.prototype, 'uploadImageWithProgress').mockReturnValue(
      throwError(() => new Error('Archivo demasiado grande')),
    );
    const store = TestBed.inject(StoreManagementStore);
    store.uploadImage(5, new File(['x'], 'x.png'));
    expect(store.uploadError()).toBe('Archivo demasiado grande');
    expect(store.uploadProgress()).toBeNull();
  });

  it('clearUploadState() reinicia progreso y error a null', () => {
    vi.spyOn(ProductsApiEndpoint.prototype, 'uploadImageWithProgress').mockReturnValue(
      throwError(() => new Error('x')),
    );
    const store = TestBed.inject(StoreManagementStore);
    store.uploadImage(5, new File(['x'], 'x.png'));
    expect(store.uploadError()).not.toBeNull();

    store.clearUploadState();
    expect(store.uploadProgress()).toBeNull();
    expect(store.uploadError()).toBeNull();
  });
});
