export class ExecutionReportModel {
  public eventName: string = 'executionReport';
  public eventTime!: number;
  public symbol!: string;
  public clientOrderId!: string;
  public side!: string;
  public orderType!: string;
  public timeInForce!: string;
  public orderQuantity!: number;
  public orderPrice!: number;
  public stopPrice!: number;
  public trailingDelta!: number;
  public icebergQuantity!: number;
  public orderListId!: number;
  public originalClientOrderId!: string;
  public currentExecutionType!: string;
  public currentOrderStatus!: string;
  public orderRejectReason!: string; // Order reject reason; will be an error code.
  public orderId!: number;
  public lastExecutedQuantity!: number;
  public cumulativeFilledQuantity!: number;
  public lastExecutedPrice!: number;
  public commissionAmount!: number;
  public commissionAsset!: any;
  public transationTime!: number;
  public tradeId!: number;
  public isOrderInBook!: boolean;
  public isMakerSide!: boolean;
  public orderCreationTime!: number;
  public cumulativeQuoteAsset!: number; // Cumulative quote asset transacted quantity
  public lastQuoteAsset!: number; // Last quote asset transacted quantity (i.e. lastPrice * lastQty)(i.e. lastPrice * lastQty)
  public quoteOrderQuantity!: number;
  public strategyId!: number;
  public strategyType!: number;
}
