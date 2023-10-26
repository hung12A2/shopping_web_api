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
  post,
  requestBody,
  response
} from '@loopback/rest';
import {Category} from '../models';
import {CategoryRepository} from '../repositories';
import {basicAuthorization} from '../services';

@authenticate('jwt')
@authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
export class CategoryController {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
  ) { }

  @post('/categories')
  @response(200, {
    description: 'Category model instance',
    content: {'application/json': {schema: getModelSchemaRef(Category)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Category, {
            title: 'NewCategory',
            exclude: ['id'],
          }),
        },
      },
    })
    category: Omit<Category, 'id'>,
  ): Promise<Category> {
    if ((await this.categoryRepository.find({where: {catename: category.catename}})).length > 0) {
      this.response.status(400).send("Đã tồn tại catename này rồi ")
    }
    return this.categoryRepository.create(category);
  }

  @get('/categories')
  @response(200, {
    description: 'Array of Category model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Category, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Category) filter?: Filter<Category>,
  ): Promise<Category[]> {
    return this.categoryRepository.find(filter);
  }

  @get('/categories/{id}')
  @response(200, {
    description: 'Category model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Category, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Category, {exclude: 'where'}) filter?: FilterExcludingWhere<Category>
  ): Promise<Category> {
    return this.categoryRepository.findById(id, filter);
  }

  @patch('/categories/{id}')
  @response(204, {
    description: 'Category PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['catename', 'image'],
            properties: {
              catename: {
                type: 'string'
              },
              image: {
                type: 'string'
              }
            }
          },
        },
      },
    })
    category: Category,
  ): Promise<void> {
    await this.categoryRepository.updateById(id, category);
  }


  @del('/categories/{id}')
  @response(204, {
    description: 'Category DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.categoryRepository.deleteById(id);
  }
}
