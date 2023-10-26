import {Entity, belongsTo, hasMany, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import {Dishincart} from './dishincart.model';
import {User} from './user.model';

@model()
export class Cart extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuid()
  })
  id?: string;

  @property({
    type: 'number',
    required: false,
    default: 0,
  })
  totalPrice: number;

  @hasMany(() => Dishincart, {keyTo: 'idOfCart'})
  dishincarts: Dishincart[];

  @belongsTo(() => User, {name: 'User'})
  idOfUser: string;

  constructor(data?: Partial<Cart>) {
    super(data);
  }
}

export interface CartRelations {
  // describe navigational properties here
}

export type CartWithRelations = Cart & CartRelations;
