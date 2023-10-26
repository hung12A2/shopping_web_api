import {
  Filter,
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param
} from '@loopback/rest';
import {
  Rating
} from '../models';
import {DishRepository} from '../repositories';

export class DishRatingController {
  constructor(
    @repository(DishRepository) protected dishRepository: DishRepository,
  ) { }

  @get('/dishes/{id}/ratings', {
    responses: {
      '200': {
        description: 'Array of Dish has many Rating',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Rating)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Rating>,
  ): Promise<Rating[]> {
    return this.dishRepository.ratings(id).find(filter);
  }
}
