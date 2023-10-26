import {Entity, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';


@model()
export class Dishinorder extends Entity {
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
  idOfOrder: string;

  @property({
    type: 'string',
    required: true,
  })
  idOfDish: string;

  @property({
    type: 'number',
    required: true,
  })
  quantity: number;

  @property({
    type: 'boolean',
    required: false,
    default: false
  })
  canceled: boolean;


  constructor(data?: Partial<Dishinorder>) {
    super(data);
  }
}

export interface DishinorderRelations {
  // describe navigational properties here
}

export type DishinorderWithRelations = Dishinorder & DishinorderRelations;
