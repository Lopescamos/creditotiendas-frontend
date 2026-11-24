import { ScheduledInstallment } from './scheduled-installment.entity';
export interface PaymentPlan {
  installmentCount: number;
  installmentAmount: number;
  totalInterest: number;
  totalAmount: number;
  schedule: ScheduledInstallment[];
}
