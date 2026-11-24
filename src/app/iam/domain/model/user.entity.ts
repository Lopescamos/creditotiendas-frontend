import { BaseEntity } from '../../../shared/domain/model/base-entity';
export class User implements BaseEntity {
  constructor(
    public id: number,
    public email: string,
    public firstName: string,
    public lastName: string,
    public role: string,
    public active: boolean,
    public storeIds: number[] = [],
    public password: string | null = null,
  ) {}
  get fullName(): string { return `${this.firstName} ${this.lastName}`.trim(); }
}
