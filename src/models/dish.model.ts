import {Entity, belongsTo, hasMany, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import {Category} from './category.model';
import {Rating} from './rating.model';


@model()
export class Dish extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  image: string;
  @property({
    type: 'string',
    required: true,
  })
  dishDescription: string;

  @property({
    type: 'string',
    required: true,
  })
  dishDetails: string;

  @property({
    type: 'string',
    required: true,
  })
  catename: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  @property({
    type: 'number',
    required: true,
  })
  countRating: number;

  @property({
    type: 'number',
    required: true,
  })
  rating: number;

  @property({
    type: 'number',
    required: true,
  })
  countInStock: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isBestSeller: boolean;

  @hasMany(() => Rating, {keyTo: 'idOfDish'})
  ratings: Rating[];

  @belongsTo(() => Category, {name: 'Category'})
  idOfCategory: string;

  constructor(data?: Partial<Dish>) {
    super(data);
  }
}

export interface DishRelations {
  // describe navigational properties here
}

export type DishWithRelations = Dish & DishRelations;
