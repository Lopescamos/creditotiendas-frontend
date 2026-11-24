import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Store } from '../domain/model/store.entity';
import { StoreResource, StoresResponse } from './store-response';
export class StoreAssembler implements BaseAssembler<Store, StoreResource, StoresResponse> {
  toEntityFromResource(r: StoreResource): Store {
    return new Store(r.id, r.ruc ?? '', r.razonSocial ?? '', r.nombreComercial ?? '',
      r.direccion ?? '', r.telefono ?? '', r.active ?? true);
  }
  toResourceFromEntity(e: Store): StoreResource {
    return { id: e.id, ruc: e.ruc, razonSocial: e.razonSocial, nombreComercial: e.nombreComercial,
      direccion: e.direccion, telefono: e.telefono, active: e.active };
  }
  toEntitiesFromResponse(res: StoresResponse): Store[] {
    return (res.stores ?? []).map((s) => this.toEntityFromResource(s));
  }
}
