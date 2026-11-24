import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { SaleLineItem } from './line-item.entity';
import { PaymentPlan } from './payment-plan.entity';
import { InterestRateType, CapitalizationPeriod } from './credit-profile.entity';
export enum CreditSaleStatus { ACTIVE='ACTIVE', OVERDUE='OVERDUE', PAID_ON_TIME='PAID_ON_TIME', PAID_LATE='PAID_LATE' }
export enum SaleModality     { SINGLE_PAYMENT='SINGLE_PAYMENT', INSTALLMENTS='INSTALLMENTS' }

export class CreditSale implements BaseEntity {
  constructor(
    public id: number,
    public creditProfileId: number,
    public storeId: number,
    public items: SaleLineItem[],
    public totalAmount: number,
    public installmentCount: number,
    public graceDays: number,
    public modality: SaleModality,
    // 5 columnas snapshot — se congelan al registrar la venta
    public interestRateSnapshot: number,
    public interestRateTypeSnapshot: InterestRateType,
    public capitalizationPeriodSnapshot: CapitalizationPeriod | null,
    public lateInterestRateSnapshot: number,
    public lateInterestRateTypeSnapshot: InterestRateType,
    public paymentPlan: PaymentPlan | null,
    public status: CreditSaleStatus,
    public saleDate: string,
  ) {}
}
