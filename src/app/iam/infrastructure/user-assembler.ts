import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { User } from '../domain/model/user.entity';
import { UserResource, UsersResponse } from './user-response';
export class UserAssembler implements BaseAssembler<User, UserResource, UsersResponse> {
  toEntityFromResource(r: UserResource): User {
    return new User(r.id, r.email ?? '', r.firstName ?? '', r.lastName ?? '',
      r.role ?? '', r.active ?? true, r.storeIds ?? []);
  }
  toResourceFromEntity(e: User): UserResource {
    return { id: e.id, email: e.email, firstName: e.firstName, lastName: e.lastName,
      role: e.role, active: e.active, storeIds: e.storeIds };
  }
  toEntitiesFromResponse(res: UsersResponse): User[] {
    return (res.users ?? []).map((u) => this.toEntityFromResource(u));
  }
}
