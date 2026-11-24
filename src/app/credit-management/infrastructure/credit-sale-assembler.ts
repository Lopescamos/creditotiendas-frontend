import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { CreditSale, CreditSaleStatus, SaleModality } from '../domain/model/credit-sale.entity';
import { InterestRateType, CapitalizationPeriod } from '../domain/model/credit-profile.entity';
import { CreditSaleResource, CreditSalesResponse } from './credit-sale-response';

const toRT = (s?: string) => s === 'EFFECTIVE' ? InterestRateType.EFFECTIVE : InterestRateType.NOMINAL;
const toCP = (s?: string | null) => (s && Object.values(CapitalizationPeriod).includes(s as any)) ? s as CapitalizationPeriod : null;

export class CreditSaleAssembler implements BaseAssembler<CreditSale, CreditSaleResource, CreditSalesResponse> {
  toEntityFromResource(r: CreditSaleResource): CreditSale {
    return new CreditSale(
      r.id, r.creditProfileId ?? 0, r.storeId ?? 0,
      r.items ?? [], r.totalAmount ?? 0,
      r.installmentCount ?? 1, r.graceDays ?? 0,
      (r.modality as SaleModality) ?? SaleModality.INSTALLMENTS,
      r.interestRateSnapshot ?? 0, toRT(r.interestRateTypeSnapshot),
      toCP(r.capitalizationPeriodSnapshot),
      r.lateInterestRateSnapshot ?? 0, toRT(r.lateInterestRateTypeSnapshot),
      r.paymentPlan ?? null,
      (r.status as CreditSaleStatus) ?? CreditSaleStatus.ACTIVE,
      r.saleDate ?? '',
    );
  }
  toResourceFromEntity(e: CreditSale): CreditSaleResource {
    return {
      id: e.id, creditProfileId: e.creditProfileId, storeId: e.storeId,
      items: e.items, totalAmount: e.totalAmount,
      installmentCount: e.installmentCount, graceDays: e.graceDays, modality: e.modality,
      interestRateSnapshot: e.interestRateSnapshot, interestRateTypeSnapshot: e.interestRateTypeSnapshot,
      capitalizationPeriodSnapshot: e.capitalizationPeriodSnapshot,
      lateInterestRateSnapshot: e.lateInterestRateSnapshot, lateInterestRateTypeSnapshot: e.lateInterestRateTypeSnapshot,
      paymentPlan: e.paymentPlan,
      status: e.status, saleDate: e.saleDate,
    };
  }
  toEntitiesFromResponse(res: CreditSalesResponse): CreditSale[] {
    return (res.creditSales ?? []).map((s) => this.toEntityFromResource(s));
  }
}
