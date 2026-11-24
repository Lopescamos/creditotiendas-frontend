import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { SaleLineItem } from '../domain/model/line-item.entity';
export interface PurchaseRequestResource extends BaseResource {
  creditProfileId?: number; storeId?: number;
  items?: SaleLineItem[]; totalAmount?: number;
  status?: string; requestedAt?: string; respondedAt?: string | null;
  rejectionReason?: string | null; generatedSaleId?: number | null;
}
export interface PurchaseRequestsResponse extends BaseResponse { purchaseRequests?: PurchaseRequestResource[]; }
