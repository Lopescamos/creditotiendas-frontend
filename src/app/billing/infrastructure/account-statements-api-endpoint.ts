import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AccountStatement } from '../domain/model/account-statement.entity';
import { AccountStatementAssembler } from './account-statement-assembler';
import { AccountStatementResource, AccountStatementsResponse } from './account-statement-response';

export class AccountStatementsApiEndpoint {
  private assembler = new AccountStatementAssembler();
  constructor(private http: HttpClient) {}

  listByProfile(creditProfileId: number): Observable<AccountStatement[]> {
    const url = `${environment.apiBaseUrl}/api/v1/credit-profiles/${creditProfileId}/account-statements`;
    return this.http.get<AccountStatementResource[] | AccountStatementsResponse>(url).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as AccountStatementsResponse)),
    );
  }
  get(id: number): Observable<AccountStatement> {
    return this.http.get<AccountStatementResource>(`${environment.apiBaseUrl}/api/v1/account-statements/${id}`)
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
}
