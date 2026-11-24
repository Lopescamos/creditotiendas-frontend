import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { PaymentAllocation } from '../domain/model/payment.entity';
export interface PaymentResource extends BaseResource {
  creditProfileId?: number; creditSaleId?: number;
  paymentDate?: string; totalAmount?: number;
  allocations?: PaymentAllocation[];
}
export interface PaymentsResponse extends BaseResponse { payments?: PaymentResource[]; }
