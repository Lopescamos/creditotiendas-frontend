import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
export interface AccountStatementResource extends BaseResource {
  creditProfileId?: number; period?: string;
  previousBalance?: number; periodPurchases?: number; periodPayments?: number;
  periodInterest?: number; periodLateFees?: number;
  finalBalance?: number; generatedAt?: string;
}
export interface AccountStatementsResponse extends BaseResponse { accountStatements?: AccountStatementResource[]; }
