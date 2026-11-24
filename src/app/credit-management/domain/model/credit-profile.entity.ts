import { BaseEntity } from '../../../shared/domain/model/base-entity';
export enum CreditProfileStatus { ACTIVE = 'ACTIVE', SUSPENDED = 'SUSPENDED', BLOCKED = 'BLOCKED', CLOSED = 'CLOSED' }
export enum InterestRateType  { NOMINAL = 'NOMINAL', EFFECTIVE = 'EFFECTIVE' }
export enum CapitalizationPeriod { DAILY='DAILY', MONTHLY='MONTHLY', QUARTERLY='QUARTERLY', SEMIANNUAL='SEMIANNUAL', ANNUAL='ANNUAL' }

export class CreditProfile implements BaseEntity {
  constructor(
    public id: number,
    public storeId: number,
    public clientUserId: number,
    public clientFullName: string,
    public clientDocument: string,
    public currencyId: number,
    public creditLimit: number,
    public availableCredit: number,
    public interestRate: number,
    public interestRateType: InterestRateType,
    public capitalizationPeriod: CapitalizationPeriod | null,
    public lateInterestRate: number,
    public lateInterestRateType: InterestRateType,
    public maxTermDays: number,
    public cutoffDay: number,
    public paymentDay: number,
    public status: CreditProfileStatus,
  ) {}
}
