import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
export interface RoleResource extends BaseResource { name?: string; description?: string; }
export interface RolesResponse extends BaseResponse { roles?: RoleResource[]; }
