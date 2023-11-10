import {Entity, hasMany, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import {Dishinorder} from './dishinorder.model';

@model()
export class Order extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuid(),
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  idOfUser: string;

  @property({
    type: 'string',
    required: true,
  })
  shippingAddress: string;

  @property({
    type: 'string',
    required: true,
  })
  paymentMethod: string;

  @property({
    type: 'number',
    required: true,
    default: 10,
  })
  shippingPrice: Number;

  @property({
    type: 'number',
    required: true,
  })
  totalPrice: Number;

  @property({
    type: 'boolean',
    required: true,
    default: true,
  })
  accepted: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  canceled: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  isProcessed: boolean;

  @hasMany(() => Dishinorder, {keyTo: 'idOfOrder'})
  dishinorders: Dishinorder[];

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
