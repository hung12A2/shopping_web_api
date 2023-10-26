import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {ShopDataSource} from '../datasources';
import {Dishincart, DishincartRelations, Dish} from '../models';
import {DishRepository} from './dish.repository';

export class DishincartRepository extends DefaultCrudRepository<
  Dishincart,
  typeof Dishincart.prototype.id,
  DishincartRelations
> {

  public readonly Dish: BelongsToAccessor<Dish, typeof Dishincart.prototype.id>;

  constructor(
    @inject('datasources.shop') dataSource: ShopDataSource, @repository.getter('DishRepository') protected dishRepositoryGetter: Getter<DishRepository>,
  ) {
    super(Dishincart, dataSource);
    this.Dish = this.createBelongsToAccessorFor('Dish', dishRepositoryGetter,);
    this.registerInclusionResolver('Dish', this.Dish.inclusionResolver);
  }
}
