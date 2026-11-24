import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
export interface ProductResource extends BaseResource {
  storeId?: number; name?: string; description?: string;
  type?: string; supplier?: string; brand?: string;
  measurementUnitId?: number | null;
  cashPrice?: number; creditPrice?: number;
  imageUrl?: string | null; active?: boolean;
}
export interface ProductsResponse extends BaseResponse { products?: ProductResource[]; }
