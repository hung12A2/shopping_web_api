import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {
  Cart,
  Dish,
  Dishincart
} from '../models';
import {CartRepository, DishRepository, UserRepository} from '../repositories';
import {basicAuthorization} from '../services';

export class CartDishincartController {
  constructor(
    @repository(CartRepository) protected cartRepository: CartRepository,
    @repository(DishRepository) protected dishRepositpry: DishRepository,
    @repository(UserRepository) protected userRepositpry: UserRepository,
  ) { }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})

  @get('/carts/dishincarts', {
    responses: {
      '200': {
        description: 'Array of Cart has many Dishincart',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Dishincart)},
          },
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER)
    currentUser: UserProfile,
    @param.query.object('filter') filter?: Filter<Dishincart>,
  ): Promise<any> {
    const Userid = currentUser[securityId]
    const id = (await this.userRepositpry.cart(Userid).get()).id
    const listdishincart = await this.cartRepository.dishincarts(id).find();
    const listdishid = listdishincart.map(dish => dish.idOfDish);
    const listdishquantity = listdishincart.map(dish => dish.quantity);
    const listdish = await this.dishRepositpry.find({where: {id: {inq: listdishid}}})
    const listdishwithquantity = listdishid.map((iddish, index) => {
      const dish = listdish.find(dish => dish.id === iddish)
      return {
        ...dish,
        quantity: listdishquantity[index],
      }
    })
    return listdishwithquantity;
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @post('/carts/{dishid}/dishincarts', {
    responses: {
      '200': {
        description: 'Cart model instance',
        content: {'application/json': {schema: getModelSchemaRef(Dishincart)}},
      },
    },
  })
  async create(
    @inject(SecurityBindings.USER)
    currentUser: UserProfile,
    @param.path.string('dishid') dishid: typeof Dish.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dishincart, {
            title: 'NewDishincartInCart',
            exclude: ['id', 'idOfCart', 'idOfDish'],
            optional: ['idOfCart']
          }),
        },
      },
    }) dishincart: Omit<Dishincart, 'id'>,
  ): Promise<any> {
    const Userid = currentUser[securityId]
    const id = (await this.userRepositpry.cart(Userid).get()).id
    let dishincartadd: Dishincart
    dishincartadd = Object.assign({
      ...dishincart,
      idOfDish: dishid,
    })
    const dish = await this.dishRepositpry.findById(dishid);
    const cart = await this.userRepositpry.cart(Userid).get()
    const totalPrice = cart.totalPrice + dish.price * dishincartadd.quantity
    let updatePriceCart: Cart = Object.assign({totalPrice: totalPrice})
    await this.cartRepository.dishincarts(id).create(dishincartadd)
    await this.userRepositpry.cart(Userid).patch(updatePriceCart)
    return this.userRepositpry.cart(Userid).get();
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @patch('/carts/{dishid}/dishincarts', {
    responses: {
      '200': {
        description: 'Cart.Dishincart PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @inject(SecurityBindings.USER)
    currentUser: UserProfile,
    @param.path.string('dishid') dishid: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dishincart, {
            partial: true,
            exclude: ['id', 'idOfCart', 'idOfDish']
          }),
        },
      },
    })
    dishincart: Partial<Dishincart>,
    @param.query.object('where', getWhereSchemaFor(Dishincart)) where: Where<Dishincart> = {idOfDish: dishid},
  ): Promise<void> {
    const Userid = currentUser[securityId]
    const cart = (await this.userRepositpry.cart(Userid).get())
    const id = cart.id;
    const dish = await this.dishRepositpry.findById(dishid);
    const olddishincart = await this.cartRepository.dishincarts(id).find({where: {'idOfDish': dishid}});
    let updateCart: Cart;
    if (dishincart.quantity == 0) {
      const newTotalPrice = cart.totalPrice - olddishincart[0].quantity * (dish).price;
      updateCart = Object.assign({
        totalPrice: newTotalPrice,
      })
      await this.cartRepository.updateById(id, updateCart)
      await this.cartRepository.dishincarts(id).delete(where);
    }

    if (dishincart.quantity) {
      const newTotalPrice = cart.totalPrice - olddishincart[0].quantity * (dish).price + dishincart.quantity * (dish).price;
      updateCart = Object.assign({
        totalPrice: newTotalPrice,
      })
      await this.cartRepository.updateById(id, updateCart)
      await this.cartRepository.dishincarts(id).patch(dishincart, where);
    }

    // return this.cartRepository.findById(id);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @del('/carts/{dishincartid}/dishincarts', {
    responses: {
      '200': {
        description: 'Cart.Dishincart DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @inject(SecurityBindings.USER)
    currentUser: UserProfile,
    @param.path.string('dishincartid') dishincartid: string,
    @param.query.object('where', getWhereSchemaFor(Dishincart)) where: Where<Dishincart> = {idOfDish: dishincartid}
  ): Promise<any> {
    const Userid = currentUser[securityId]
    const id = (await this.userRepositpry.cart(Userid).get()).id
    const cart = await this.userRepositpry.cart(Userid).get();
    const dish = await this.dishRepositpry.findById(dishincartid);
    const listdish = await this.cartRepository.dishincarts(id).find({where: {idOfDish: dishincartid}});
    const quantity = listdish[0].quantity;
    const newTotalPrice = cart.totalPrice - dish.price * quantity;
    let updateCart: Cart = Object.assign({totalPrice: newTotalPrice, })
    await this.cartRepository.updateById(id, updateCart);
    await this.cartRepository.dishincarts(id).delete(where);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['customer'], voters: [basicAuthorization]})
  @del('/carts/dishincarts', {
    responses: {
      '200': {
        description: 'Cart.Dishincart DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async deleteAll(
    @inject(SecurityBindings.USER)
    currentUser: UserProfile,
    @param.query.object('where', getWhereSchemaFor(Dishincart)) where: Where<Dishincart> = {}
  ): Promise<Count> {
    const Userid = currentUser[securityId]
    const id = (await this.userRepositpry.cart(Userid).get()).id
    let updateCart: Cart = Object.assign({totalPrice: 0})
    await this.cartRepository.updateById(id, updateCart);
    return this.cartRepository.dishincarts(id).delete(where)
  }
}
