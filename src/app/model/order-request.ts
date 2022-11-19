import { TimeInForce } from './../enum/time-in-force';
import { Side } from "../enum/side";

export interface OrderRequest {
    symbol: string;
    quantity: number;
    price: number;
    side?: Side;
    timeInForce?: TimeInForce;
    clientOrderId?: number;
}
