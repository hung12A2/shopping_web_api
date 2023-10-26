import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {ShopDataSource} from '../datasources';
import {Dish, DishRelations, Rating, Category} from '../models';
import {RatingRepository} from './rating.repository';
import {CategoryRepository} from './category.repository';

export class DishRepository extends DefaultCrudRepository<
  Dish,
  typeof Dish.prototype.id,
  DishRelations
> {

  public readonly ratings: HasManyRepositoryFactory<Rating, typeof Dish.prototype.id>;

  public readonly Category: BelongsToAccessor<Category, typeof Dish.prototype.id>;

  constructor(
    @inject('datasources.shop') dataSource: ShopDataSource, @repository.getter('RatingRepository') protected ratingRepositoryGetter: Getter<RatingRepository>, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Dish, dataSource);
    this.Category = this.createBelongsToAccessorFor('Category', categoryRepositoryGetter,);
    this.registerInclusionResolver('Category', this.Category.inclusionResolver);
    this.ratings = this.createHasManyRepositoryFactoryFor('ratings', ratingRepositoryGetter,);
    this.registerInclusionResolver('ratings', this.ratings.inclusionResolver);
  }
}
