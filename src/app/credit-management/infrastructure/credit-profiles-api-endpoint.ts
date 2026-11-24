import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreditProfile } from '../domain/model/credit-profile.entity';
import { CreditProfileAssembler } from './credit-profile-assembler';
import { CreditProfileResource, CreditProfilesResponse } from './credit-profile-response';

export class CreditProfilesApiEndpoint {
  private assembler = new CreditProfileAssembler();
  constructor(private http: HttpClient) {}

  listByStore(storeId: number): Observable<CreditProfile[]> {
    const url = `${environment.apiBaseUrl}/api/v1/stores/${storeId}/credit-profiles`;
    return this.http.get<CreditProfileResource[] | CreditProfilesResponse>(url).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as CreditProfilesResponse)),
    );
  }
  create(storeId: number, p: CreditProfile): Observable<CreditProfile> {
    const url = `${environment.apiBaseUrl}/api/v1/stores/${storeId}/credit-profiles`;
    return this.http.post<CreditProfileResource>(url, this.assembler.toResourceFromEntity(p))
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  get(id: number): Observable<CreditProfile> {
    return this.http.get<CreditProfileResource>(`${environment.apiBaseUrl}/api/v1/credit-profiles/${id}`)
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  update(id: number, p: CreditProfile): Observable<CreditProfile> {
    return this.http.put<CreditProfileResource>(`${environment.apiBaseUrl}/api/v1/credit-profiles/${id}`,
      this.assembler.toResourceFromEntity(p))
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  updateStatus(id: number, status: string): Observable<CreditProfile> {
    return this.http.patch<CreditProfileResource>(`${environment.apiBaseUrl}/api/v1/credit-profiles/${id}/status`, { status })
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
}
