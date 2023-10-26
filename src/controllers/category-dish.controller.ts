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
  post,
  requestBody
} from '@loopback/rest';
import {
  Category,
  Dish,
} from '../models';
import {CategoryRepository, DishRepository} from '../repositories';

import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {basicAuthorization} from '../services';

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

  @post('/categories/{id}/dishes', {
    responses: {
      '200': {
        description: 'Category model instance',
        content: {'application/json': {schema: getModelSchemaRef(Dish)}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  async create(
    @param.path.string('id') id: typeof Category.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dish, {
            title: 'NewDishInCategory',
            exclude: ['id', 'idOfCategory', 'catename'],
            optional: ['idOfCategory']
          }),
        },
      },
    }) dish: Omit<Dish, 'id'>,
  ): Promise<any> {
    if ((await this.dishRepository.find({where: {name: dish.name}})).length > 0) {
      return this.response.status(400).send("Đã tồn tại tên món ăn này rồi ")
    }
    dish.catename = (await this.categoryRepository.findById(id)).catename
    return this.categoryRepository.dishes(id).create(dish);
  }

}
