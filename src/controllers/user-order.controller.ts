import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  CountSchema,
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {
  Cart,
  Dish,
  Dishinorder,
  Order
} from '../models';
import {CartRepository, DishRepository, OrderRepository, UserRepository} from '../repositories';

@authenticate('jwt')
export class UserOrderController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(CartRepository) protected cartRepository: CartRepository,
    @repository(DishRepository) protected dishRepository: DishRepository,
    @repository(OrderRepository) protected orderRepository: OrderRepository,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

  ) { }

  @get('/users/orders', {
    responses: {
      '200': {
        description: 'Array of User has many Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Order)},
          },
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.query.object('filter') filter?: Filter<Order>,
  ): Promise<any> {
    const id = currentUserProfile[securityId];
    const orderlist = await this.userRepository.orders(id).find(filter);
    const orderwithdish = await Promise.all(orderlist.map(async order => {

      const listdishinorder = await this.orderRepository.dishinorders(order.id).find();
      const listdishwithquantity = await Promise.all(listdishinorder.map(async (dishinorder) => {
        const dish = await this.dishRepository.findById(dishinorder.idOfDish);
        return ({
          ...dish,
          quantity: dishinorder.quantity
        })
      }))

      return ({
        ...order,
        listDish: listdishwithquantity,
      })

    }))

    return orderwithdish
  }

  @post('/users/orders', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async create(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['shippingAddress', 'paymentMethod', 'shippingPrice',],
            properties: {
              shippingAddress: {
                type: 'string'
              },
              paymentMethod: {
                type: 'string'
              },
              shippingPrice: {
                type: 'number'
              },
            }
          },
        },
      },
    }) shippinginfo: any
  ): Promise<Order> {
    const id = currentUserProfile[securityId];
    const cartid = (await this.userRepository.cart(id).get()).id
    const listdishincart = await this.cartRepository.dishincarts(cartid).find();
    const listiddishincart = listdishincart.map(dishincart => {
      return dishincart.idOfDish;
    })
    const listquantitydishincart = listdishincart.map(dish => {
      return dish.quantity;
    })
    const listdish = await this.dishRepository.find({where: {id: {inq: listiddishincart}}})
    const cartPrice = (await this.userRepository.cart(id).get()).totalPrice;
    const totalPrice = cartPrice + shippinginfo.shippingPrice;
    let order: Order;
    order = Object.assign({
      idOfUser: id,
      shippingAddress: shippinginfo.shippingAddress,
      paymentMethod: shippinginfo.paymentMethod,
      shippingPrice: shippinginfo.shippingPrice,
      totalPrice: totalPrice,
    })
    this.cartRepository.dishincarts(cartid).delete();
    let upatecart: Cart;
    upatecart = Object.assign ({
      totalPrice: 0
    })
    this.userRepository.cart(id).patch(upatecart);
    const orderid = (await this.userRepository.orders(id).create(order)).id;
    await Promise.all(listiddishincart.map(async (iddish, index) => {
      const dish = listdish.find(dish => dish.id === iddish)
      if (dish) {
        if (dish?.countInStock) {
          let updatedish: Dish;
          const newcount = dish!.countInStock - listquantitydishincart[index];
          if (newcount < 0) {
            this.response.status(400).send("không đủ số lượng ")
          }
          updatedish = Object.assign({countInStock: newcount});
          this.dishRepository.updateById(dish.id, updatedish);
          let dishinorder: Dishinorder;
          dishinorder = Object.assign({
            idOfDish: dish.id,
            quantity: listquantitydishincart[index],
          })
          this.orderRepository.dishinorders(orderid).create(dishinorder);
        }
      }
    }))
    return this.orderRepository.findById(orderid);
  }

  @patch('/users/{orderid}/orders', {
    responses: {
      '200': {
        description: 'User.Order DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('orderid') orderid: string,
    @param.query.object('where', getWhereSchemaFor(Order)) where: Where<Order> = {id: orderid},
  ): Promise<any> {
    const id = currentUserProfile[securityId];
    const dishinorders = await this.orderRepository.dishinorders(orderid).find();
    await Promise.all(dishinorders.map(async dishinorder => {
      const quantity = dishinorder.quantity;
      const dishid = dishinorder.idOfDish;
      const dish = await this.dishRepository.findById(dishid);
      const newcountinstock = dish.countInStock + quantity;
      let updatedish: Dish;
      updatedish = Object.assign({countInStock: newcountinstock});
      await this.dishRepository.updateById(dishid, updatedish);
    }))
    let updatedishinorder: Dishinorder;
    updatedishinorder = Object.assign({canceled: true})
    let updateorder: Order;
    updateorder = Object.assign({canceled: true})
    await this.orderRepository.dishinorders(orderid).patch(updatedishinorder);
    await this.userRepository.orders(id).patch(updateorder, where);
    this.response.status(200).send("Xóa đơn hàng thành công");
  }
}
