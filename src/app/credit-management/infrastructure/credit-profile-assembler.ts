import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { CreditProfile, CreditProfileStatus, InterestRateType, CapitalizationPeriod } from '../domain/model/credit-profile.entity';
import { CreditProfileResource, CreditProfilesResponse } from './credit-profile-response';

const toRateType = (s?: string): InterestRateType =>
  (s === 'EFFECTIVE') ? InterestRateType.EFFECTIVE : InterestRateType.NOMINAL;

const toCapPeriod = (s?: string | null): CapitalizationPeriod | null => {
  if (!s) return null;
  return (Object.values(CapitalizationPeriod).includes(s as any) ? s : null) as CapitalizationPeriod | null;
};

export class CreditProfileAssembler implements BaseAssembler<CreditProfile, CreditProfileResource, CreditProfilesResponse> {
  toEntityFromResource(r: CreditProfileResource): CreditProfile {
    return new CreditProfile(
      r.id, r.storeId ?? 0, r.clientUserId ?? 0,
      r.clientFullName ?? '', r.clientDocument ?? '',
      r.currencyId ?? 1,
      r.creditLimit ?? 0, r.availableCredit ?? 0,
      r.interestRate ?? 0, toRateType(r.interestRateType),
      toCapPeriod(r.capitalizationPeriod),
      r.lateInterestRate ?? 0, toRateType(r.lateInterestRateType),
      r.maxTermDays ?? 30, r.cutoffDay ?? 1, r.paymentDay ?? 15,
      (r.status as CreditProfileStatus) ?? CreditProfileStatus.ACTIVE,
    );
  }
  toResourceFromEntity(e: CreditProfile): CreditProfileResource {
    return {
      id: e.id, storeId: e.storeId, clientUserId: e.clientUserId,
      clientFullName: e.clientFullName, clientDocument: e.clientDocument,
      currencyId: e.currencyId,
      creditLimit: e.creditLimit, availableCredit: e.availableCredit,
      interestRate: e.interestRate, interestRateType: e.interestRateType,
      capitalizationPeriod: e.capitalizationPeriod,
      lateInterestRate: e.lateInterestRate, lateInterestRateType: e.lateInterestRateType,
      maxTermDays: e.maxTermDays, cutoffDay: e.cutoffDay, paymentDay: e.paymentDay,
      status: e.status,
    };
  }
  toEntitiesFromResponse(res: CreditProfilesResponse): CreditProfile[] {
    return (res.creditProfiles ?? []).map((p) => this.toEntityFromResource(p));
  }
}
