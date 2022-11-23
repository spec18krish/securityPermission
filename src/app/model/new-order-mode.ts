
import { OrderType } from "../enum/order-type";
import { Side } from "../enum/side";
import { TimeInForce } from "../enum/time-in-force";

export class NewOrderModel {
    symbol!: string;
    orderId!: number;
    binanceOrderId!: number;
    orderHistoryId!: number;
    orderBuySellId!: string;
    orderListId!: number;
    clientOrderId!: string;
    transactTime!: any;
    price!: any;
    origQty!: number;
    executedQty!: number;
    cummulativeQuoteQty!: number;
    status!: string;
    timeInForce!: TimeInForce;
    type!: OrderType;
    side!: Side;
    strategyId!: number;
    strategyType!: number;
    isBuySellCompleted!: boolean;
}
