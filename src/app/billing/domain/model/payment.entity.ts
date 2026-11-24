import { BaseEntity } from '../../../shared/domain/model/base-entity';
export interface PaymentAllocation {
  installmentId: number;
  installmentNumber?: number;
  lateFeeAmount: number;
  interestAmount: number;
  capitalAmount: number;
}
export class Payment implements BaseEntity {
  constructor(
    public id: number,
    public creditProfileId: number,
    public creditSaleId: number,
    public paymentDate: string,
    public totalAmount: number,
    public allocations: PaymentAllocation[],
  ) {}
}
