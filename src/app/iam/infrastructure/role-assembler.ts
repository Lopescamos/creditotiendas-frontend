import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Role } from '../domain/model/role.entity';
import { RoleResource, RolesResponse } from './role-response';
export class RoleAssembler implements BaseAssembler<Role, RoleResource, RolesResponse> {
  toEntityFromResource(r: RoleResource): Role { return new Role(r.id, r.name ?? '', r.description ?? ''); }
  toResourceFromEntity(e: Role): RoleResource { return { id: e.id, name: e.name, description: e.description }; }
  toEntitiesFromResponse(res: RolesResponse): Role[] { return (res.roles ?? []).map((r) => this.toEntityFromResource(r)); }
}
