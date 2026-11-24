import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { OperationLog, OperationAction } from '../domain/model/operation-log.entity';
import { OperationLogResource, OperationLogsResponse } from './operation-log-response';
export class OperationLogAssembler implements BaseAssembler<OperationLog, OperationLogResource, OperationLogsResponse> {
  toEntityFromResource(r: OperationLogResource): OperationLog {
    return new OperationLog(r.id, r.userId ?? null,
      (r.action as OperationAction) ?? OperationAction.UPDATE,
      r.entity ?? '', r.entityId ?? null,
      r.detail ?? '', r.ipAddress ?? null, r.occurredAt ?? '');
  }
  toResourceFromEntity(e: OperationLog): OperationLogResource {
    return { id: e.id, userId: e.userId, action: e.action, entity: e.entity,
      entityId: e.entityId, detail: e.detail, ipAddress: e.ipAddress, occurredAt: e.occurredAt };
  }
  toEntitiesFromResponse(res: OperationLogsResponse): OperationLog[] {
    return (res.operationLogs ?? []).map((l) => this.toEntityFromResource(l));
  }
}
