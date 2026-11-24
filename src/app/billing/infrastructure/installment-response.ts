import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
export interface InstallmentResource extends BaseResource {
  creditSaleId?: number; creditProfileId?: number;
  installmentNumber?: number; dueDate?: string;
  capital?: number; interest?: number; installmentAmount?: number;
  remainingBalance?: number; status?: string; paidAt?: string | null;
}
export interface InstallmentsResponse extends BaseResponse { installments?: InstallmentResource[]; }
