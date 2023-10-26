import {Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import {Cart} from './cart.model';
import {Order} from './order.model';
import {Rating} from './rating.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuid(),
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  fullname: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  gender: string;

  @property({
    type: 'string',
    required: true,
  })
  phonenumber: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  role: string;

  @hasMany(() => Rating, {keyTo: 'idOfUser'})
  ratings: Rating[];

  @hasOne(() => Cart, {keyTo: 'idOfUser'})
  cart: Cart;

  @hasMany(() => Order, {keyTo: 'idOfUser'})
  orders: Order[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
