import { BaseEntity } from '../../../shared/domain/model/base-entity';
export class AuthenticatedUser implements BaseEntity {
  constructor(
    public id: number,
    public email: string,
    public fullName: string,
    public role: string,
    public token: string,
    public storeIds: number[] = [],
  ) {}
}
