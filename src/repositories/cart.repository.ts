import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {ShopDataSource} from '../datasources';
import {Cart, CartRelations, Dishincart, User} from '../models';
import {DishincartRepository} from './dishincart.repository';
import {UserRepository} from './user.repository';

export class CartRepository extends DefaultCrudRepository<
  Cart,
  typeof Cart.prototype.id,
  CartRelations
> {

  public readonly dishincarts: HasManyRepositoryFactory<Dishincart, typeof Cart.prototype.id>;

  public readonly User: BelongsToAccessor<User, typeof Cart.prototype.id>;

  constructor(
    @inject('datasources.shop') dataSource: ShopDataSource, @repository.getter('DishincartRepository') protected dishincartRepositoryGetter: Getter<DishincartRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Cart, dataSource);
    this.User = this.createBelongsToAccessorFor('User', userRepositoryGetter,);
    this.registerInclusionResolver('User', this.User.inclusionResolver);
    this.dishincarts = this.createHasManyRepositoryFactoryFor('dishincarts', dishincartRepositoryGetter,);
    this.registerInclusionResolver('dishincarts', this.dishincarts.inclusionResolver);
  }
}
