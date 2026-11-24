import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Product, ProductType } from '../domain/model/product.entity';
import { ProductResource, ProductsResponse } from './product-response';
export class ProductAssembler implements BaseAssembler<Product, ProductResource, ProductsResponse> {
  toEntityFromResource(r: ProductResource): Product {
    const type = (r.type === 'SERVICE' ? ProductType.SERVICE : ProductType.PRODUCT);
    return new Product(r.id, r.storeId ?? 0, r.name ?? '', r.description ?? '', type,
      r.supplier ?? '', r.brand ?? '', r.measurementUnitId ?? null,
      r.cashPrice ?? 0, r.creditPrice ?? 0, r.imageUrl ?? null, r.active ?? true);
  }
  toResourceFromEntity(e: Product): ProductResource {
    return { id: e.id, storeId: e.storeId, name: e.name, description: e.description, type: e.type,
      supplier: e.supplier, brand: e.brand, measurementUnitId: e.measurementUnitId,
      cashPrice: e.cashPrice, creditPrice: e.creditPrice, imageUrl: e.imageUrl, active: e.active };
  }
  toEntitiesFromResponse(res: ProductsResponse): Product[] {
    return (res.products ?? []).map((p) => this.toEntityFromResource(p));
  }
}
