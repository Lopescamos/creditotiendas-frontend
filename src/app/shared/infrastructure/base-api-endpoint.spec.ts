import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, lastValueFrom } from 'rxjs';
import { BaseApiEndpoint } from './base-api-endpoint';
import { BaseAssembler } from './base-assembler';
import { BaseEntity } from '../domain/model/base-entity';
import { BaseResource, BaseResponse } from './base-response';

interface Thing extends BaseEntity { nombre: string; }
interface ThingResource extends BaseResource { nombre: string; }
interface ThingResponse extends BaseResponse { data: ThingResource[]; }

class ThingAssembler implements BaseAssembler<Thing, ThingResource, ThingResponse> {
  toEntityFromResource(r: ThingResource): Thing { return { id: r.id, nombre: r.nombre }; }
  toEntitiesFromResponse(r: ThingResponse): Thing[] { return r.data.map((x) => this.toEntityFromResource(x)); }
  toResourceFromEntity(e: Thing): ThingResource { return { id: e.id, nombre: e.nombre }; }
}

class ThingsEndpoint extends BaseApiEndpoint<Thing, ThingResource, ThingResponse, ThingAssembler> {}

function makeHttp(response$: Observable<unknown>): HttpClient {
  return {
    get: () => response$,
    post: () => response$,
    put: () => response$,
    delete: () => response$,
  } as unknown as HttpClient;
}

function errorOf(status: number, body: unknown = null, statusText = ''): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body, statusText });
}

describe('BaseApiEndpoint - mapeo de errores HTTP', () => {
  const assembler = new ThingAssembler();

  it('mapea 403 a "sin permiso"', async () => {
    const http = makeHttp(throwError(() => errorOf(403)));
    const endpoint = new ThingsEndpoint(http, '/api/things', assembler);
    await expect(lastValueFrom(endpoint.getAll())).rejects.toThrow(/sin permiso/);
  });

  it('mapea 404 a "recurso no encontrado"', async () => {
    const http = makeHttp(throwError(() => errorOf(404)));
    const endpoint = new ThingsEndpoint(http, '/api/things', assembler);
    await expect(lastValueFrom(endpoint.getById(1))).rejects.toThrow(/recurso no encontrado/);
  });

  it('en 422 extrae el mensaje del backend tal cual (regla de negocio)', async () => {
    const http = makeHttp(throwError(() => errorOf(422, { message: 'RUC ya existe' })));
    const endpoint = new ThingsEndpoint(http, '/api/things', assembler);
    await expect(lastValueFrom(endpoint.create({ id: 0, nombre: 'x' })))
      .rejects.toThrow(/RUC ya existe/);
  });

  it('en 422 sin mensaje cae en "regla de negocio no cumplida"', async () => {
    const http = makeHttp(throwError(() => errorOf(422, {})));
    const endpoint = new ThingsEndpoint(http, '/api/things', assembler);
    await expect(lastValueFrom(endpoint.update({ id: 1, nombre: 'x' }, 1)))
      .rejects.toThrow(/regla de negocio no cumplida/);
  });

  it('en 500 usa el statusText del backend', async () => {
    const http = makeHttp(throwError(() => errorOf(500, null, 'Internal Server Error')));
    const endpoint = new ThingsEndpoint(http, '/api/things', assembler);
    await expect(lastValueFrom(endpoint.delete(9)))
      .rejects.toThrow(/Internal Server Error/);
  });
});

describe('BaseApiEndpoint - happy path con assembler', () => {
  const assembler = new ThingAssembler();

  it('getAll convierte un BaseResponse al listado tipado', async () => {
    const http = makeHttp(of({ data: [{ id: 1, nombre: 'Uno' }] } as ThingResponse));
    const endpoint = new ThingsEndpoint(http, '/api/things', assembler);
    const result = await lastValueFrom(endpoint.getAll());
    expect(result).toEqual([{ id: 1, nombre: 'Uno' }]);
  });

  it('getAll acepta tambien un arreglo crudo (sin envoltorio)', async () => {
    const http = makeHttp(of([{ id: 2, nombre: 'Dos' }] as ThingResource[]));
    const endpoint = new ThingsEndpoint(http, '/api/things', assembler);
    const result = await lastValueFrom(endpoint.getAll());
    expect(result).toEqual([{ id: 2, nombre: 'Dos' }]);
  });

  it('getById mapea el recurso devuelto a entidad de dominio', async () => {
    const http = makeHttp(of({ id: 7, nombre: 'Siete' } as ThingResource));
    const endpoint = new ThingsEndpoint(http, '/api/things', assembler);
    const result = await lastValueFrom(endpoint.getById(7));
    expect(result).toEqual({ id: 7, nombre: 'Siete' });
  });
});
