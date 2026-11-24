import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
export interface StoreResource extends BaseResource {
  ruc?: string; razonSocial?: string; nombreComercial?: string;
  direccion?: string; telefono?: string; active?: boolean;
}
export interface StoresResponse extends BaseResponse { stores?: StoreResource[]; }
