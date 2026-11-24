import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Store } from '../domain/model/store.entity';
import { Product } from '../domain/model/product.entity';
import { Currency } from '../domain/model/currency.entity';
import { MeasurementUnit } from '../domain/model/measurement-unit.entity';
import { StoresApiEndpoint } from '../infrastructure/stores-api-endpoint';
import { ProductsApiEndpoint } from '../infrastructure/products-api-endpoint';
import { CurrenciesApiEndpoint, MeasurementUnitsApiEndpoint } from '../infrastructure/catalog-apis';

@Injectable({ providedIn: 'root' })
export class StoreManagementStore {
  private http = inject(HttpClient);
  private storesEp = new StoresApiEndpoint(this.http);
  private productsEp = new ProductsApiEndpoint(this.http);
  private currenciesEp = new CurrenciesApiEndpoint(this.http);
  private unitsEp = new MeasurementUnitsApiEndpoint(this.http);

  private storesSignal = signal<Store[]>([]);
  private productsSignal = signal<Product[]>([]);
  private currenciesSignal = signal<Currency[]>([]);
  private unitsSignal = signal<MeasurementUnit[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  // Pendiente #3 — progreso/error de upload de imagen
  private uploadProgressSignal = signal<number | null>(null);
  private uploadErrorSignal = signal<string | null>(null);

  readonly stores = this.storesSignal.asReadonly();
  readonly products = this.productsSignal.asReadonly();
  readonly currencies = this.currenciesSignal.asReadonly();
  readonly units = this.unitsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly uploadProgress = this.uploadProgressSignal.asReadonly();
  readonly uploadError = this.uploadErrorSignal.asReadonly();

  loadStores() {
    this.loadingSignal.set(true);
    this.storesEp.getAll().subscribe({
      next: (s) => { this.storesSignal.set(s); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  createStore(s: Store) { this.storesEp.create(s).subscribe({ next: (x) => this.storesSignal.update((xs) => [...xs, x]), error: (e: Error) => this.errorSignal.set(e.message) }); }
  updateStore(s: Store) { this.storesEp.update(s, s.id).subscribe({ next: (x) => this.storesSignal.update((xs) => xs.map((y) => y.id === x.id ? x : y)), error: (e: Error) => this.errorSignal.set(e.message) }); }
  toggleStoreStatus(id: number, active: boolean) {
    this.storesEp.updateStatus(id, active).subscribe({
      next: (x) => this.storesSignal.update((xs) => xs.map((y) => y.id === x.id ? x : y)),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }

  loadProductsByStore(storeId: number) {
    this.loadingSignal.set(true);
    this.productsEp.listByStore(storeId).subscribe({
      next: (p) => { this.productsSignal.set(p); this.loadingSignal.set(false); },
      error: (e: Error) => { this.errorSignal.set(e.message); this.loadingSignal.set(false); },
    });
  }
  createProduct(storeId: number, p: Product) {
    this.productsEp.createInStore(storeId, p).subscribe({
      next: (x) => this.productsSignal.update((xs) => [...xs, x]),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  updateProduct(p: Product) {
    this.productsEp.update(p, p.id).subscribe({
      next: (x) => this.productsSignal.update((xs) => xs.map((y) => y.id === x.id ? x : y)),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  toggleProductStatus(id: number, active: boolean) {
    this.productsEp.updateStatus(id, active).subscribe({
      next: (x) => this.productsSignal.update((xs) => xs.map((y) => y.id === x.id ? x : y)),
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
  uploadImage(id: number, file: File) {
    // US-11 — pendiente #3: tracking de progreso + error explicito.
    this.uploadErrorSignal.set(null);
    this.uploadProgressSignal.set(0);
    this.productsEp.uploadImageWithProgress(id, file).subscribe({
      next: (ev) => {
        this.uploadProgressSignal.set(ev.progress);
        if (ev.done && ev.product) {
          const updated = ev.product;
          this.productsSignal.update((xs) => xs.map((y) => y.id === updated.id ? updated : y));
          // mantenemos el 100 un instante para que la UI lo muestre; limpiar es responsabilidad del caller.
        }
      },
      error: (e: Error) => {
        this.uploadErrorSignal.set(e.message);
        this.uploadProgressSignal.set(null);
      },
    });
  }
  clearUploadState() { this.uploadProgressSignal.set(null); this.uploadErrorSignal.set(null); }

  loadCatalogs() {
    forkJoin({ c: this.currenciesEp.getAll(), u: this.unitsEp.getAll() }).subscribe({
      next: ({ c, u }) => { this.currenciesSignal.set(c); this.unitsSignal.set(u); },
      error: (e: Error) => this.errorSignal.set(e.message),
    });
  }
}
