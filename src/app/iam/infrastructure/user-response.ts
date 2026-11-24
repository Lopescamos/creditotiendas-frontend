import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
export interface UserResource extends BaseResource {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  active?: boolean;
  storeIds?: number[];
}
export interface UsersResponse extends BaseResponse { users?: UserResource[]; }
