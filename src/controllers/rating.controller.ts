import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  repository
} from '@loopback/repository';
import {
  del,
  param,
  patch,
  requestBody,
  response
} from '@loopback/rest';
import {Dish, Rating} from '../models';
import {DishRepository, RatingRepository} from '../repositories';
import {basicAuthorization} from '../services';


@authenticate('jwt')
@authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
export class RatingController {
  constructor(
    @repository(RatingRepository)
    public ratingRepository: RatingRepository,
    @repository(DishRepository)
    public dishRepository: DishRepository,
  ) { }

  @patch('/ratings/{id}')
  @response(204, {
    description: 'Rating PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['rating', 'comment'],
            properties: {
              rating: {
                type: 'number'
              },
              comment: {
                type: 'string'
              }
            }
          }
        }
      }
    }) rating: Omit<Rating, 'id' | 'idOfDish' | 'idOfUser'>,
  ): Promise<void> {
    const oldRating = await this.ratingRepository.findById(id);
    const dishid = oldRating.idOfDish;
    const dish = await this.dishRepository.findById(dishid);
    const avgRating = (dish.countRating * dish.rating - oldRating.rating + rating.rating) / dish.countRating
    await this.ratingRepository.updateById(id, rating);
    let newdish: Dish;
    newdish = Object.assign({rating: avgRating})
    await this.dishRepository.updateById(dishid, newdish)
  }

  @del('/ratings/{id}')
  @response(204, {
    description: 'Rating DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const deltetaRating = await this.ratingRepository.findById(id);
    const dishid = deltetaRating.idOfDish;
    const dish = await this.dishRepository.findById(dishid);
    const newcountrating = dish.countRating - 1;
    const newrating = (dish.countRating * dish.rating - deltetaRating.rating) / newcountrating;
    let newdish: Dish;
    newdish = Object.assign({
      rating: newrating,
      countRating: newcountrating,
    })
    await this.ratingRepository.deleteById(id);
    await this.dishRepository.updateById(dishid, newdish);
  }
}
