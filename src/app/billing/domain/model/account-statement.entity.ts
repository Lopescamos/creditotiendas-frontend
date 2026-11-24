import { BaseEntity } from '../../../shared/domain/model/base-entity';
export class AccountStatement implements BaseEntity {
  constructor(
    public id: number,
    public creditProfileId: number,
    public period: string,           // YYYY-MM
    public previousBalance: number,
    public periodPurchases: number,
    public periodPayments: number,
    public periodInterest: number,
    public periodLateFees: number,
    public finalBalance: number,
    public generatedAt: string,
  ) {}
}
