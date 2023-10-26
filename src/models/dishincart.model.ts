import {Entity, belongsTo, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import {Dish} from './dish.model';


@model()
export class Dishincart extends Entity {
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
  idOfCart: string;

  @property({
    type: 'number',
    required: true,
  })
  quantity: number;

  @belongsTo(() => Dish, {name: 'Dish'})
  idOfDish: string;

  constructor(data?: Partial<Dishincart>) {
    super(data);
  }
}

export interface DishincartRelations {
  // describe navigational properties here
}

export type DishincartWithRelations = Dishincart & DishincartRelations;
