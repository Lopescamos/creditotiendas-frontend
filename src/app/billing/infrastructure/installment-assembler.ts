import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Installment, InstallmentStatus } from '../domain/model/installment.entity';
import { InstallmentResource, InstallmentsResponse } from './installment-response';
export class InstallmentAssembler implements BaseAssembler<Installment, InstallmentResource, InstallmentsResponse> {
  toEntityFromResource(r: InstallmentResource): Installment {
    return new Installment(r.id, r.creditSaleId ?? 0, r.creditProfileId ?? 0,
      r.installmentNumber ?? 0, r.dueDate ?? '',
      r.capital ?? 0, r.interest ?? 0, r.installmentAmount ?? 0,
      r.remainingBalance ?? 0,
      (r.status as InstallmentStatus) ?? InstallmentStatus.PENDING,
      r.paidAt ?? null);
  }
  toResourceFromEntity(e: Installment): InstallmentResource {
    return { id: e.id, creditSaleId: e.creditSaleId, creditProfileId: e.creditProfileId,
      installmentNumber: e.installmentNumber, dueDate: e.dueDate,
      capital: e.capital, interest: e.interest, installmentAmount: e.installmentAmount,
      remainingBalance: e.remainingBalance, status: e.status, paidAt: e.paidAt };
  }
  toEntitiesFromResponse(res: InstallmentsResponse): Installment[] {
    return (res.installments ?? []).map((i) => this.toEntityFromResource(i));
  }
}
