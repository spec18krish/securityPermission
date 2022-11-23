export class KlineCandleStickStreamData {
  public eventName!: string;
  public eventTime!: number;
  public symbol!: string;
  public data!: KlineData;
}

export class KlineData {
  public klineStartTime!: number;
  public klineCloseTime!: number;
  public symbol!: string;
  public interval!: string;
  public firstTradeId!: number;
  public lastTradeId!: number;
  public openPrice!: number;
  public closePrice!: number;
  public highPrice!: number;
  public lowPrice!: number;
  public baseAssetVolume!: number;
  public numberOfTrades!: number;
  public isKindleClosed!: boolean;
  public quoteAssetVolume!: number;
  public takerBuyBaseAssetVolume!: number;
  public takeBuyQuoteAssetVolume!: number;
}
