import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {ShopDataSource} from '../datasources';
import {Order, OrderRelations, Dishinorder} from '../models';
import {DishinorderRepository} from './dishinorder.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {

  public readonly dishinorders: HasManyRepositoryFactory<Dishinorder, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.shop') dataSource: ShopDataSource, @repository.getter('DishinorderRepository') protected dishinorderRepositoryGetter: Getter<DishinorderRepository>,
  ) {
    super(Order, dataSource);
    this.dishinorders = this.createHasManyRepositoryFactoryFor('dishinorders', dishinorderRepositoryGetter,);
    this.registerInclusionResolver('dishinorders', this.dishinorders.inclusionResolver);
  }
}
