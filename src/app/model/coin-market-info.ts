import { NewOrderModel } from './new-order-mode';
export class CoinMarketInfo extends NewOrderModel {
  stopPrice!: number;
  icebergQty!: number;
  updateTime!: number;
  isWorking!: boolean;
  origQuoteOrderQty!: number;
  time!: number;
}
