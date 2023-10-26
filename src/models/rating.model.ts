import {Entity, belongsTo, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import {Dish} from './dish.model';
import {User} from './user.model';

@model()
export class Rating extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => uuid(),
  })
  id?: string;
  @property({
    type: 'number',
    required: true,
  })
  rating: number;

  @property({
    type: 'string',
    required: true,
  })
  comment: string;

  @belongsTo(() => User, {name: 'User'})
  idOfUser: string;

  @belongsTo(() => Dish, {name: 'Dish'})
  idOfDish: string;

  constructor(data?: Partial<Rating>) {
    super(data);
  }
}

export interface RatingRelations {
  // describe navigational properties here
}

export type RatingWithRelations = Rating & RatingRelations;
