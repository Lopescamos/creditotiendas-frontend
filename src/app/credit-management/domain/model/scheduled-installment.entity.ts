export interface ScheduledInstallment {
  number: number;
  dueDate: string;
  principal: number;
  interest: number;
  installment: number;
  remainingBalance: number;
}
