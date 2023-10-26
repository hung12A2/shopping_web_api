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
  get,
  getModelSchemaRef,
  param,
  patch,
  response
} from '@loopback/rest';
import {Dish, Dishinorder, Order} from '../models';
import {CartRepository, DishRepository, OrderRepository, UserRepository} from '../repositories';
import {basicAuthorization} from '../services';


@authenticate('jwt')
@authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})
export class OrderadminController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(CartRepository) protected cartRepository: CartRepository,
    @repository(DishRepository) protected dishRepository: DishRepository,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) { }

  @get('/orders')
  @response(200, {
    description: 'Array of Order model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<any> {
    const orderlist = await this.orderRepository.find(filter);
    const orderwithdishlist = await Promise.all(orderlist.map(async order => {
      const dishinorderlist = await this.orderRepository.dishinorders(order.id).find();

      const listdish = await Promise.all(dishinorderlist.map(async dishinorder => {
        const quantity = dishinorder.quantity;
        const dishid = dishinorder.idOfDish;
        const dish = await this.dishRepository.findById(dishid);
        return ({
          ...dish,
          quantity: quantity,
        })
      }))

      return ({
        ...order,
        listdish: listdish,
      })
    }))

    return orderwithdishlist;
  }

  @get('/orders/{id}')
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Order, {exclude: 'where'}) filter?: FilterExcludingWhere<Order>
  ): Promise<any> {
    const order = await this.orderRepository.findById(id);

    const dishinorderlist = await this.orderRepository.dishinorders(order.id).find();

    const listdish = await Promise.all(dishinorderlist.map(async dishinorder => {
      const quantity = dishinorder.quantity;
      const dishid = dishinorder.idOfDish;
      const dish = await this.dishRepository.findById(dishid);
      return ({
        ...dish,
        quantity: quantity,
      })
    }))

    const orderwithdishlist = ({
      ...order,
      listdish: listdish,
    })

    return orderwithdishlist;
  }

  @patch('/orders/{orderid}')
  @response(204, {
    description: 'Order PATCH success',
  })
  async updateByorderid(
    @param.path.string('orderid') orderid: string,
  ): Promise<any> {
    //await this.orderRepository.updateById(id, order);
    //return accepted;
    const order = await this.orderRepository.findById(orderid)
    const orderaccepted = order.accepted;

    const dishinorderlist = await this.orderRepository.dishinorders(orderid).find();

    await Promise.all(dishinorderlist.map(async dishinorder => {
      const dishid = dishinorder.idOfDish;
      const quantity = dishinorder.quantity;
      const dish = await this.dishRepository.findById(dishid);
      const oldcountinstock = dish.countInStock;
      const newcount = oldcountinstock + quantity;
      const newdishinorder: Dishinorder = Object.assign({
        canceled: true,
      })
      const newdish: Dish = Object.assign({
        countInStock: newcount,
      })
      await this.orderRepository.dishinorders(orderid).patch(newdishinorder, {id: dishinorder.id})
      await this.dishRepository.updateById(dishid, newdish);

    }))

    const newOrder: Order = Object.assign({
      accepted: false,
    })

    const data = await this.orderRepository.updateById(orderid, newOrder);

    this.response.status(200).send({
      message: "update thành công",
      data: data,
    })
  }
}
