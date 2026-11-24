import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
export interface OperationLogResource extends BaseResource {
  userId?: number | null; action?: string;
  entity?: string; entityId?: number | null;
  detail?: string; ipAddress?: string | null;
  occurredAt?: string;
}
export interface OperationLogsResponse extends BaseResponse { operationLogs?: OperationLogResource[]; }
