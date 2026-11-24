import { BaseEntity } from '../../../shared/domain/model/base-entity';
export class Currency implements BaseEntity {
  constructor(public id: number, public code: string, public name: string, public symbol: string) {}
}
