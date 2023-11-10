import {
  Filter,
  repository
} from '@loopback/repository';
import {
  Response,
  RestBindings,
  get,
  getModelSchemaRef,
  param,
} from '@loopback/rest';
import {
  Dish,
} from '../models';
import {CategoryRepository, DishRepository} from '../repositories';
import {inject} from '@loopback/core';

export class CategoryDishController {
  constructor(
    @repository(CategoryRepository) protected categoryRepository: CategoryRepository,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    @repository(DishRepository) protected dishRepository: DishRepository,
  ) { }

  @get('/categories/{id}/dishes', {
    responses: {
      '200': {
        description: 'Array of Category has many Dish',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Dish)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Dish>,
  ): Promise<Dish[]> {
    return this.categoryRepository.dishes(id).find(filter);
  }

  
}
