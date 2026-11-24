import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { SaleLineItem } from './line-item.entity';
export enum PurchaseRequestStatus { PENDING='PENDING', APPROVED='APPROVED', REJECTED='REJECTED' }

export class PurchaseRequest implements BaseEntity {
  constructor(
    public id: number,
    public creditProfileId: number,
    public storeId: number,
    public items: SaleLineItem[],
    public totalAmount: number,
    public status: PurchaseRequestStatus,
    public requestedAt: string,
    public respondedAt: string | null,
    public rejectionReason: string | null,
    public generatedSaleId: number | null,
  ) {}
}
