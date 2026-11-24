import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
export interface CreditProfileResource extends BaseResource {
  storeId?: number; clientUserId?: number;
  clientFullName?: string; clientDocument?: string;
  currencyId?: number;
  creditLimit?: number; availableCredit?: number;
  interestRate?: number; interestRateType?: string;
  capitalizationPeriod?: string | null;
  lateInterestRate?: number; lateInterestRateType?: string;
  maxTermDays?: number; cutoffDay?: number; paymentDay?: number;
  status?: string;
}
export interface CreditProfilesResponse extends BaseResponse { creditProfiles?: CreditProfileResource[]; }
