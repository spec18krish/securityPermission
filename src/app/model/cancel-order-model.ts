import { OrderType } from "../enum/order-type";
import { Side } from "../enum/side";
import { TimeInForce } from "../enum/time-in-force";
import { WithdrawStatus } from "../enum/width-draw-status";


export interface CancelOrderModel {
    symbol: string;
    origClientOrderId: number;
    orderId: number;
    orderListId: number;
    clientOrderId: number;
    price: number;
    origQty: number;
    executedQty: number;
    cummulativeQuoteQty: number;
    status: WithdrawStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: Side;
}
