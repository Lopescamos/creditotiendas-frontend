import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Currency } from '../domain/model/currency.entity';
import { MeasurementUnit } from '../domain/model/measurement-unit.entity';

export class CurrenciesApiEndpoint {
  private url = `${environment.apiBaseUrl}/api/v1/currencies`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<Currency[]> {
    return this.http.get<any>(this.url).pipe(map((r) => {
      const list = Array.isArray(r) ? r : (r.currencies ?? []);
      return list.map((x: any) => new Currency(x.id, x.code ?? '', x.name ?? '', x.symbol ?? ''));
    }));
  }
}
export class MeasurementUnitsApiEndpoint {
  private url = `${environment.apiBaseUrl}/api/v1/measurement-units`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<MeasurementUnit[]> {
    return this.http.get<any>(this.url).pipe(map((r) => {
      const list = Array.isArray(r) ? r : (r.measurementUnits ?? []);
      return list.map((x: any) => new MeasurementUnit(x.id, x.code ?? '', x.name ?? ''));
    }));
  }
}
