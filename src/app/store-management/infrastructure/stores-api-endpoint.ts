import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Store } from '../domain/model/store.entity';
import { StoreAssembler } from './store-assembler';
import { StoreResource, StoresResponse } from './store-response';
export class StoresApiEndpoint extends BaseApiEndpoint<Store, StoreResource, StoresResponse, StoreAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/stores`, new StoreAssembler());
  }
  updateStatus(id: number, active: boolean): Observable<Store> {
    return this.http.patch<StoreResource>(`${this.endpointUrl}/${id}/status`, { active })
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
}
