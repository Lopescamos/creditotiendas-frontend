import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseEntity } from '../domain/model/base-entity';
import { BaseAssembler } from './base-assembler';
import { BaseResource, BaseResponse } from './base-response';

export abstract class BaseApiEndpoint<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
  TAssembler extends BaseAssembler<TEntity, TResource, TResponse>,
> {
  constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: TAssembler,
  ) {}

  getAll(): Observable<TEntity[]> {
    return this.http.get<TResponse | TResource[]>(this.endpointUrl).pipe(
      map((r) => Array.isArray(r)
        ? r.map((x) => this.assembler.toEntityFromResource(x))
        : this.assembler.toEntitiesFromResponse(r as TResponse)),
      catchError(this.handleError('GET all')),
    );
  }
  getById(id: number): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map((r) => this.assembler.toEntityFromResource(r)),
      catchError(this.handleError('GET by id')),
    );
  }
  create(entity: TEntity): Observable<TEntity> {
    return this.http.post<TResource>(this.endpointUrl, this.assembler.toResourceFromEntity(entity)).pipe(
      map((r) => this.assembler.toEntityFromResource(r)),
      catchError(this.handleError('POST')),
    );
  }
  update(entity: TEntity, id: number): Observable<TEntity> {
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, this.assembler.toResourceFromEntity(entity)).pipe(
      map((r) => this.assembler.toEntityFromResource(r)),
      catchError(this.handleError('PUT')),
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`).pipe(catchError(this.handleError('DELETE')));
  }

  protected handleError(op: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const msg = error.status === 404 ? `${op}: recurso no encontrado`
                : error.status === 403 ? `${op}: sin permiso`
                : error.status === 422 ? `${op}: ${this.extractMessage(error) ?? 'regla de negocio no cumplida'}`
                : error.error instanceof ErrorEvent ? `${op}: ${error.error.message}`
                : `${op}: ${this.extractMessage(error) ?? error.statusText ?? 'Error inesperado'}`;
      return throwError(() => new Error(msg));
    };
  }
  private extractMessage(err: HttpErrorResponse): string | null {
    const body = err.error;
    if (!body) return null;
    if (typeof body === 'string') return body;
    return body.message ?? body.error ?? null;
  }
}
