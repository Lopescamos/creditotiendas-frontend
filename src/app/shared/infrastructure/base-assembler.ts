import { BaseEntity } from '../domain/model/base-entity';
import { BaseResource, BaseResponse } from './base-response';

export interface BaseAssembler<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
> {
  toEntityFromResource(r: TResource): TEntity;
  toResourceFromEntity(e: TEntity): TResource;
  toEntitiesFromResponse(res: TResponse): TEntity[];
}
