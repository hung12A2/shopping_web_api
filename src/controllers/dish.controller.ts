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
  response,
  post
} from '@loopback/rest';
import {Dish} from '../models';
import {CategoryRepository, DishRepository} from '../repositories';
import {basicAuthorization} from '../services';


export class DishController {
  constructor(
    @repository(DishRepository)
    public dishRepository: DishRepository,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    @repository (CategoryRepository)
    private categoryRepository: CategoryRepository
  ) { }

  @post('/dishes', {
    responses: {
      '200': {
        description: 'Category model instance',
        content: {'application/json': {schema: getModelSchemaRef(Dish, )}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dish, {
            title: 'NewDishInCategory',
            exclude: ['id' ,'catename', 'countRating', 'rating' ],
            optional: ['idOfCategory']
          }),
        },
      },
    }) dish: Omit<Dish, 'id'>,
  ): Promise<any> {
    if ((await this.dishRepository.find({where: {name: dish.name}})).length > 0) {
      return this.response.status(400).send("Đã tồn tại tên món ăn này rồi ")
    }
    dish.catename = (await this.categoryRepository.findById(dish.idOfCategory)).catename
    return this.categoryRepository.dishes(dish.idOfCategory).create(dish);
  }


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
    const data =  await ((await this.dishRepository.find(filter)).map(dish => {
      return {
        id: dish.id,
        catename: dish.catename,
        rating: dish.rating,
        countRating: dish.countRating,
        image: dish.image,
        price: dish.price,
        isBestSeller: dish.isBestSeller,
        name: dish.name,
        dishDescription: dish.dishDescription,
        dishDetails: dish.dishDetails
      }
    }))
    this.response.header('Access-Control-Expose-Headers', 'Content-Range')
    return this.response.header('Content-Range', 'dishes 0-20/20').send(data);
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
