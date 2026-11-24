import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Payment } from '../domain/model/payment.entity';
import { PaymentResource, PaymentsResponse } from './payment-response';
export class PaymentAssembler implements BaseAssembler<Payment, PaymentResource, PaymentsResponse> {
  toEntityFromResource(r: PaymentResource): Payment {
    return new Payment(r.id, r.creditProfileId ?? 0, r.creditSaleId ?? 0,
      r.paymentDate ?? '', r.totalAmount ?? 0, r.allocations ?? []);
  }
  toResourceFromEntity(e: Payment): PaymentResource {
    return { id: e.id, creditProfileId: e.creditProfileId, creditSaleId: e.creditSaleId,
      paymentDate: e.paymentDate, totalAmount: e.totalAmount, allocations: e.allocations };
  }
  toEntitiesFromResponse(res: PaymentsResponse): Payment[] {
    return (res.payments ?? []).map((p) => this.toEntityFromResource(p));
  }
}
