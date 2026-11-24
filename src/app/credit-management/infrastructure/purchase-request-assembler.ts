import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { PurchaseRequest, PurchaseRequestStatus } from '../domain/model/purchase-request.entity';
import { PurchaseRequestResource, PurchaseRequestsResponse } from './purchase-request-response';
export class PurchaseRequestAssembler implements BaseAssembler<PurchaseRequest, PurchaseRequestResource, PurchaseRequestsResponse> {
  toEntityFromResource(r: PurchaseRequestResource): PurchaseRequest {
    return new PurchaseRequest(r.id, r.creditProfileId ?? 0, r.storeId ?? 0,
      r.items ?? [], r.totalAmount ?? 0,
      (r.status as PurchaseRequestStatus) ?? PurchaseRequestStatus.PENDING,
      r.requestedAt ?? '', r.respondedAt ?? null,
      r.rejectionReason ?? null, r.generatedSaleId ?? null);
  }
  toResourceFromEntity(e: PurchaseRequest): PurchaseRequestResource {
    return { id: e.id, creditProfileId: e.creditProfileId, storeId: e.storeId,
      items: e.items, totalAmount: e.totalAmount, status: e.status,
      requestedAt: e.requestedAt, respondedAt: e.respondedAt,
      rejectionReason: e.rejectionReason, generatedSaleId: e.generatedSaleId };
  }
  toEntitiesFromResponse(res: PurchaseRequestsResponse): PurchaseRequest[] {
    return (res.purchaseRequests ?? []).map((p) => this.toEntityFromResource(p));
  }
}
