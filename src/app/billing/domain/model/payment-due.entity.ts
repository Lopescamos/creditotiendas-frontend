export interface PaymentDueBreakdown {
  installmentId: number;
  installmentNumber: number;
  dueDate: string;
  capital: number;
  interest: number;
  lateFee: number;
  daysOverdue: number;
  total: number;
}
export interface PaymentDue {
  creditProfileId: number;
  asOf: string;
  items: PaymentDueBreakdown[];
  totalAmount: number;
}
