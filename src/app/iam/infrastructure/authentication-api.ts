import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticatedUser } from '../domain/model/authenticated-user.entity';

interface SignInRequest { email: string; password: string; }
interface SignInResponse {
  id: number;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  token: string;
  storeIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class AuthenticationApi {
  private http = inject(HttpClient);
  private endpoint = `${environment.apiBaseUrl}/api/v1/authentication`;

  signIn(email: string, password: string): Observable<AuthenticatedUser> {
    return this.http.post<SignInResponse>(`${this.endpoint}/sign-in`, { email, password } as SignInRequest).pipe(
      map((r) => new AuthenticatedUser(
        r.id, r.email,
        (r.fullName ?? `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim()) || r.email,
        r.role, r.token, r.storeIds ?? [],
      )),
      catchError((e) => throwError(() => new Error(e?.error?.message ?? 'Credenciales inválidas'))),
    );
  }
}
