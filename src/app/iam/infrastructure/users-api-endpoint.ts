import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { User } from '../domain/model/user.entity';
import { UserAssembler } from './user-assembler';
import { UserResource, UsersResponse } from './user-response';

interface CreateUserResource {
  email: string; password: string;
  firstName: string; lastName: string;
  role: string; storeIds?: number[];
}

export class UsersApiEndpoint extends BaseApiEndpoint<User, UserResource, UsersResponse, UserAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/users`, new UserAssembler());
  }
  createWithPassword(data: CreateUserResource): Observable<User> {
    return this.http.post<UserResource>(this.endpointUrl, data).pipe(
      map((r) => this.assembler.toEntityFromResource(r)),
    );
  }
  updateStatus(id: number, active: boolean): Observable<User> {
    return this.http.patch<UserResource>(`${this.endpointUrl}/${id}/status`, { active })
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  assignStore(userId: number, storeId: number): Observable<User> {
    return this.http.post<UserResource>(`${this.endpointUrl}/${userId}/stores`, { storeId })
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  unassignStore(userId: number, storeId: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${userId}/stores/${storeId}`);
  }
  me(): Observable<User> {
    return this.http.get<UserResource>(`${this.endpointUrl}/me`).pipe(
      map((r) => this.assembler.toEntityFromResource(r)),
    );
  }
}
