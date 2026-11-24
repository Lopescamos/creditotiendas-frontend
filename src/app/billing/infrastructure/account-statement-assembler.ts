import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { AccountStatement } from '../domain/model/account-statement.entity';
import { AccountStatementResource, AccountStatementsResponse } from './account-statement-response';
export class AccountStatementAssembler implements BaseAssembler<AccountStatement, AccountStatementResource, AccountStatementsResponse> {
  toEntityFromResource(r: AccountStatementResource): AccountStatement {
    return new AccountStatement(r.id, r.creditProfileId ?? 0, r.period ?? '',
      r.previousBalance ?? 0, r.periodPurchases ?? 0, r.periodPayments ?? 0,
      r.periodInterest ?? 0, r.periodLateFees ?? 0,
      r.finalBalance ?? 0, r.generatedAt ?? '');
  }
  toResourceFromEntity(e: AccountStatement): AccountStatementResource {
    return { id: e.id, creditProfileId: e.creditProfileId, period: e.period,
      previousBalance: e.previousBalance, periodPurchases: e.periodPurchases, periodPayments: e.periodPayments,
      periodInterest: e.periodInterest, periodLateFees: e.periodLateFees,
      finalBalance: e.finalBalance, generatedAt: e.generatedAt };
  }
  toEntitiesFromResponse(res: AccountStatementsResponse): AccountStatement[] {
    return (res.accountStatements ?? []).map((s) => this.toEntityFromResource(s));
  }
}
