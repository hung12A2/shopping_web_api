import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {ShopDataSource} from '../datasources';
import {User, UserRelations, Rating, Cart, Order} from '../models';
import {RatingRepository} from './rating.repository';
import {CartRepository} from './cart.repository';
import {OrderRepository} from './order.repository';

export type Credentials = {
  username: string;
  password: string;
}

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly ratings: HasManyRepositoryFactory<Rating, typeof User.prototype.id>;

  public readonly cart: HasOneRepositoryFactory<Cart, typeof User.prototype.id>;

  public readonly orders: HasManyRepositoryFactory<Order, typeof User.prototype.id>;

  constructor(
    @inject('datasources.shop') dataSource: ShopDataSource, @repository.getter('RatingRepository') protected ratingRepositoryGetter: Getter<RatingRepository>, @repository.getter('CartRepository') protected cartRepositoryGetter: Getter<CartRepository>, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(User, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
    this.cart = this.createHasOneRepositoryFactoryFor('cart', cartRepositoryGetter);
    this.registerInclusionResolver('cart', this.cart.inclusionResolver);
    this.ratings = this.createHasManyRepositoryFactoryFor('ratings', ratingRepositoryGetter,);
    this.registerInclusionResolver('ratings', this.ratings.inclusionResolver);
  }
}
