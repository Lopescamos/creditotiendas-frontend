import { BaseEntity } from '../../../shared/domain/model/base-entity';
export enum InstallmentStatus { PENDING='PENDING', OVERDUE='OVERDUE', PAID_ON_TIME='PAID_ON_TIME', PAID_LATE='PAID_LATE' }
export class Installment implements BaseEntity {
  constructor(
    public id: number,
    public creditSaleId: number,
    public creditProfileId: number,
    public installmentNumber: number,
    public dueDate: string,
    public capital: number,
    public interest: number,
    public installmentAmount: number,
    public remainingBalance: number,
    public status: InstallmentStatus,
    public paidAt: string | null = null,
  ) {}
}
