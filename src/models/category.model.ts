import {Entity, hasMany, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import {Dish} from './dish.model';


@model()
export class Category extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuid()
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  catename: string;

  @property({
    type: 'string',
    required: true,
  })
  image: string;

  @hasMany(() => Dish, {keyTo: 'idOfCategory'})
  dishes: Dish[];

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;
