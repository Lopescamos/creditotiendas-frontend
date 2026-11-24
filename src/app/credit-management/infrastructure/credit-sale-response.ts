import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { SaleLineItem } from '../domain/model/line-item.entity';
import { PaymentPlan } from '../domain/model/payment-plan.entity';
export interface CreditSaleResource extends BaseResource {
  creditProfileId?: number; storeId?: number;
  items?: SaleLineItem[]; totalAmount?: number;
  installmentCount?: number; graceDays?: number; modality?: string;
  interestRateSnapshot?: number; interestRateTypeSnapshot?: string;
  capitalizationPeriodSnapshot?: string | null;
  lateInterestRateSnapshot?: number; lateInterestRateTypeSnapshot?: string;
  paymentPlan?: PaymentPlan | null;
  status?: string; saleDate?: string;
}
export interface CreditSalesResponse extends BaseResponse { creditSales?: CreditSaleResource[]; }
