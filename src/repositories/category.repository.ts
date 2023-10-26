import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {ShopDataSource} from '../datasources';
import {Category, CategoryRelations, Dish} from '../models';
import {DishRepository} from './dish.repository';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {

  public readonly dishes: HasManyRepositoryFactory<Dish, typeof Category.prototype.id>;

  constructor(
    @inject('datasources.shop') dataSource: ShopDataSource, @repository.getter('DishRepository') protected dishRepositoryGetter: Getter<DishRepository>,
  ) {
    super(Category, dataSource);
    this.dishes = this.createHasManyRepositoryFactoryFor('dishes', dishRepositoryGetter,);
    this.registerInclusionResolver('dishes', this.dishes.inclusionResolver);
  }
}
