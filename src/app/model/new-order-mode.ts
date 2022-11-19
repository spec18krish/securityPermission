
import { OrderType } from "../enum/order-type";
import { Side } from "../enum/side";
import { TimeInForce } from "../enum/time-in-force";

export interface NewOrderModel {
    symbol: string;
    orderId: number;
    orderListId: number;
    clientOrderId: number;
    transactTime: any;
    price: any;
    origQty: number;
    executedQty: number;
    cummulativeQuoteQty: number;
    status: string;
    timeInForce: TimeInForce;
    type: OrderType;
    side: Side;
    strategyId: number;
    strategyType: number;
}
