import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ShopDataSource} from '../datasources';
import {Dishinorder, DishinorderRelations} from '../models';

export class DishinorderRepository extends DefaultCrudRepository<
  Dishinorder,
  typeof Dishinorder.prototype.id,
  DishinorderRelations
> {
  constructor(
    @inject('datasources.shop') dataSource: ShopDataSource,
  ) {
    super(Dishinorder, dataSource);
  }
}
