import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {ShopDataSource} from '../datasources';
import {Rating, RatingRelations, User, Dish} from '../models';
import {UserRepository} from './user.repository';
import {DishRepository} from './dish.repository';

export class RatingRepository extends DefaultCrudRepository<
  Rating,
  typeof Rating.prototype.id,
  RatingRelations
> {

  public readonly User: BelongsToAccessor<User, typeof Rating.prototype.id>;

  public readonly Dish: BelongsToAccessor<Dish, typeof Rating.prototype.id>;

  constructor(
    @inject('datasources.shop') dataSource: ShopDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('DishRepository') protected dishRepositoryGetter: Getter<DishRepository>,
  ) {
    super(Rating, dataSource);
    this.Dish = this.createBelongsToAccessorFor('Dish', dishRepositoryGetter,);
    this.registerInclusionResolver('Dish', this.Dish.inclusionResolver);
    this.User = this.createBelongsToAccessorFor('User', userRepositoryGetter,);
    this.registerInclusionResolver('User', this.User.inclusionResolver);
  }
}
