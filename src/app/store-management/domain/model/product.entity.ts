import { BaseEntity } from '../../../shared/domain/model/base-entity';
export enum ProductType { PRODUCT = 'PRODUCT', SERVICE = 'SERVICE' }
export class Product implements BaseEntity {
  constructor(
    public id: number,
    public storeId: number,
    public name: string,
    public description: string,
    public type: ProductType,
    public supplier: string,
    public brand: string,
    public measurementUnitId: number | null,
    public cashPrice: number,
    public creditPrice: number,
    public imageUrl: string | null,
    public active: boolean,
  ) {}
}
