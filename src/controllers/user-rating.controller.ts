import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  Filter,
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {
  Dish,
  Rating
} from '../models';
import {DishRepository, UserRepository} from '../repositories';
import {basicAuthorization} from '../services';

export class UserRatingController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(DishRepository)
    public dishRepository: DishRepository
  ) { }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @get('/users/ratings', {
    responses: {
      '200': {
        description: 'Array of User has many Rating',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Rating)},
          },
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER)
    currenUserProfile: UserProfile,
    @param.query.object('filter') filter?: Filter<Rating>,

  ): Promise<Rating[]> {
    return this.userRepository.ratings(currenUserProfile[securityId]).find(filter);
  }


  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @post('/{dishid}/ratings', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Rating)}},
      },
    },
  })
  async create(
    @inject(SecurityBindings.USER)
    currenUserProfile: UserProfile,
    @param.path.string('dishid') dishid: typeof Dish.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['rating', 'comment'],
            properties: {
              rating: {
                type: 'number',
              },
              comment: {
                type: 'string',
              }
            }
          }
        },
      },
    }) rating: Omit<Rating, 'id'>,
  ): Promise<Rating> {
    const rating1 = Object.assign({
      rating: rating.rating,
      comment: rating.comment,
      idOfDish: dishid,
    })
    const data = await this.userRepository.ratings(currenUserProfile[securityId]).create(rating1);
    const dish = await this.dishRepository.findById(dishid);
    const countRating = dish.countRating + 1;
    const returnRating = (dish.rating * dish.countRating + rating.rating) / countRating
    let newDish: Dish
    newDish = Object.assign({
      countRating: countRating,
      rating: returnRating,
    })
    await this.dishRepository.updateById(dishid, newDish)
    return data;
    //this.dishRepository.update (dishid, {})
    //return data
  }
}
