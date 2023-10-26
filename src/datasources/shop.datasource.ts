import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

// const config = {
//   name: 'shop',
//   connector: 'memory',
//   localStorage: '',
//   //file: '',
//   file: '/shopweb_api/src/data/db.json'
// };

const config = {
  name: 'demo',
  connector: 'postgresql',
  url: '',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'shopping'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class ShopDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'shop';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.shop', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
