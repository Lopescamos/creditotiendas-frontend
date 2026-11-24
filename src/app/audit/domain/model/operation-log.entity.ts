import { BaseEntity } from '../../../shared/domain/model/base-entity';
export enum OperationAction {
  SIGN_IN='SIGN_IN', SIGN_IN_FAILED='SIGN_IN_FAILED',
  CREATE='CREATE', UPDATE='UPDATE', DELETE='DELETE', PATCH='PATCH',
  APPROVE='APPROVE', REJECT='REJECT', REGISTER='REGISTER',
  ASSIGN='ASSIGN', UNASSIGN='UNASSIGN', UPLOAD='UPLOAD',
}
export class OperationLog implements BaseEntity {
  constructor(
    public id: number,
    public userId: number | null,
    public action: OperationAction,
    public entity: string,
    public entityId: number | null,
    public detail: string,
    public ipAddress: string | null,
    public occurredAt: string,
  ) {}
}
