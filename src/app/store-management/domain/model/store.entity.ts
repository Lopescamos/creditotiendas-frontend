import { BaseEntity } from '../../../shared/domain/model/base-entity';
export class Store implements BaseEntity {
  constructor(
    public id: number,
    public ruc: string,
    public razonSocial: string,
    public nombreComercial: string,
    public direccion: string,
    public telefono: string,
    public active: boolean,
  ) {}
}
