import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Product } from '../domain/model/product.entity';
import { ProductAssembler } from './product-assembler';
import { ProductResource, ProductsResponse } from './product-response';

export class ProductsApiEndpoint extends BaseApiEndpoint<Product, ProductResource, ProductsResponse, ProductAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/products`, new ProductAssembler());
  }
  listByStore(storeId: number): Observable<Product[]> {
    const url = `${environment.apiBaseUrl}/api/v1/stores/${storeId}/products`;
    return this.http.get<ProductResource[] | ProductsResponse>(url).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as ProductsResponse)),
    );
  }
  createInStore(storeId: number, p: Product): Observable<Product> {
    const url = `${environment.apiBaseUrl}/api/v1/stores/${storeId}/products`;
    return this.http.post<ProductResource>(url, this.assembler.toResourceFromEntity(p))
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  updateStatus(id: number, active: boolean): Observable<Product> {
    return this.http.patch<ProductResource>(`${this.endpointUrl}/${id}/status`, { active })
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  uploadImage(id: number, file: File): Observable<Product> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<ProductResource>(`${this.endpointUrl}/${id}/image`, fd)
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
}
