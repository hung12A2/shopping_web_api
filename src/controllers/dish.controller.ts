import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  Filter,
  FilterExcludingWhere,
  repository
} from '@loopback/repository';
import {
  Response,
  RestBindings,
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  requestBody,
  response
} from '@loopback/rest';
import {Dish} from '../models';
import {DishRepository} from '../repositories';
import {basicAuthorization} from '../services';


export class DishController {
  constructor(
    @repository(DishRepository)
    public dishRepository: DishRepository,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response
  ) { }

  @get('/dishes')
  @response(200, {
    description: 'Array of Dish model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Dish, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Dish) filter?: Filter<Dish>,
  ): Promise<any> {
    return await ((await this.dishRepository.find(filter)).map(dish => {
      return {
        id: dish.id,
        catename: dish.catename,
        rating: dish.rating,
        countRating: dish.countRating,
        image: dish.image,
        price: dish.price,
        isBestSeller: dish.isBestSeller,
      }
    }))
  }


  @get('/dishes/{id}')
  @response(200, {
    description: 'Dish model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Dish, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Dish, {exclude: 'where'}) filter?: FilterExcludingWhere<Dish>
  ): Promise<Dish> {
    return this.dishRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  @patch('/dishes/{id}')
  @response(204, {
    description: 'Dish PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dish, {
            partial: true,
            exclude: ['id', 'idOfCategory']
          }),
        },
      },
    })
    dish: Dish,
  ): Promise<Dish> {
    let newcatename
    if (dish.idOfCategory) {
      newcatename = (await this.dishRepository.Category(id)).catename;
    }
    dish.catename = newcatename || '';
    await this.dishRepository.updateById(id, dish);
    return this.dishRepository.findById(id)
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  @del('/dishes/{id}')
  @response(204, {
    description: 'Dish DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.dishRepository.deleteById(id);
  }
}
