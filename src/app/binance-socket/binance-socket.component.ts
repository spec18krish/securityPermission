import { OrderType } from './../enum/order-type';
import { NewOrderModel } from './../model/new-order-mode';
import { KlineCandleStickStreamData, KlineData } from './../model/web-socket-event-models/kline-candle-stick-stream-data-model';
import { TimeInForce } from './../enum/time-in-force';
import { ExecutionReportModel } from './../model/web-socket-event-models/execution-report-model';
import { BalanceUpdateModel } from './../model/web-socket-event-models/balance-update-model';
import { OutboundAccountPosition, BalanceModel } from './../model/web-socket-event-models/out-bound-account-position-model';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Side } from '../enum/side';

@Component({
  selector: 'app-binance-socket',
  templateUrl: './binance-socket.component.html',
  styleUrls: ['./binance-socket.component.scss']
})
export class BinanceSocketComponent implements OnInit {
  coinPriceUpdate: any;
  statusUpdate: any;
  wsConinPriceUpdates!: WebSocket;
  symbolCurrency = 'trxbusd';
  $destroySubscription: Subject<boolean> = new  Subject<boolean>();
  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.initialize();
  }

  initialize() {
    this.initiateCoinPriceUpdateWebSocket();
    //this.initiateStatusUpdateWebSocket();
    setInterval(() => {
      this.initiateCoinPriceUpdateWebSocket();
     // this.initiateStatusUpdateWebSocket();
    },1500000)
  }

  initiateCoinPriceUpdateWebSocket() {
    this.getListeningKey().then((key) => {
      this.wsConinPriceUpdates = new WebSocket(`wss://testnet.binance.vision/ws/${key}/${this.symbolCurrency}@kline_1m`);
      this.wsConinPriceUpdates.onmessage = (event: any) => {
        this.mapModels(JSON.parse(event.data));
      }
    });
  }

  // initiateStatusUpdateWebSocket() {
  //   this.getListeningKey().then((key) => {
  //     this.wsConinPriceUpdates = new WebSocket(`wss://testnet.binance.vision/ws/${key}/${this.symbolCurrency}@bookTicker`);
  //     this.wsConinPriceUpdates.onmessage = (event: any) => {
  //       this.statusUpdate = JSON.parse(event.data);
  //       this.mapModels(this.statusUpdate);
  //     }
  //   });
  // }

  public onCoinPriceUpdate(data: any) {
    if (data.e === 'kline') {
      this.coinPriceUpdate = data;
    }
  }

  public mapModels(tradeData: any) {
    if (!tradeData) return;

    let eventName = tradeData?.e;

    switch(eventName) {
      case 'outboundAccountPosition' :
         this.statusUpdate = tradeData;
         this.mapOutBoundAccountPositionEvent(tradeData);
        break;
      case 'balanceUpdate':
        this.statusUpdate = tradeData;
        this.mapBalanceUpdateEvent(tradeData);
        break;
      case 'executionReport':
        this.statusUpdate = tradeData;
        this.mapExecutionReportEvent(tradeData);
        break;
      case 'kline':
        this.coinPriceUpdate = tradeData;
        this.mapKindleCandleStickStreamData(tradeData);
        break;
    }

  }

  public mapOutBoundAccountPositionEvent(tradeData: any) {
    let outboundAccountPosition = new OutboundAccountPosition();
        outboundAccountPosition.eventTime = tradeData.e;
        outboundAccountPosition.lastAccountUpdateTime = tradeData.u;
        outboundAccountPosition.balanceArray = [];
        tradeData?.b?.forEach((balance: any) => {
            let balanceModel = new BalanceModel();
            balanceModel.asset = balance.a;
            balanceModel.free = balance.f;
            balanceModel.locked = balance.l;

            outboundAccountPosition.balanceArray.push(balanceModel);
        });
        console.log(outboundAccountPosition);
  }

  public mapBalanceUpdateEvent(tradeData: any) {
    let balanceUpdateModel = new  BalanceUpdateModel();
    balanceUpdateModel.eventTime = tradeData.e;
    balanceUpdateModel.asset = tradeData.a;
    balanceUpdateModel.balanceDelta = tradeData.d;
    balanceUpdateModel.clearTime = tradeData.c;
    console.log(balanceUpdateModel);
  }

  public mapExecutionReportEvent(tradeData: any) {
    let executionReportModel = new ExecutionReportModel();
    executionReportModel.eventTime = tradeData.E;
    executionReportModel.symbol = tradeData.s;
    executionReportModel.clientOrderId = tradeData.c;
    executionReportModel.side = tradeData.S;
    executionReportModel.orderType = tradeData.o;
    executionReportModel.timeInForce = tradeData.f;
    executionReportModel.orderQuantity = tradeData.q;
    executionReportModel.orderPrice = tradeData.p;
    executionReportModel.stopPrice = tradeData.P;
    executionReportModel.trailingDelta = tradeData.d;
    executionReportModel.icebergQuantity = tradeData.F;
    executionReportModel.orderListId = tradeData.g;
    executionReportModel.originalClientOrderId = tradeData.C;
    executionReportModel.currentExecutionType = tradeData.x;
    executionReportModel.currentOrderStatus = tradeData.X;
    executionReportModel.orderRejectReason = tradeData.r;
    executionReportModel.orderId = tradeData.i;
    executionReportModel.lastExecutedQuantity = tradeData.l;
    executionReportModel.cumulativeFilledQuantity = tradeData.z;
    executionReportModel.lastExecutedPrice = tradeData.L;
    executionReportModel.commissionAmount = tradeData.n;
    executionReportModel.transationTime = tradeData.T;
    executionReportModel.tradeId = tradeData.t;
    executionReportModel.isOrderInBook = tradeData.w;
    executionReportModel.isMakerSide = tradeData.m;
    executionReportModel.orderCreationTime = tradeData.O;
    executionReportModel.cumulativeQuoteAsset = tradeData.Z;
    executionReportModel.lastQuoteAsset = tradeData.Y;
    executionReportModel.quoteOrderQuantity = tradeData.Q;
    executionReportModel.strategyId = tradeData.j;
    executionReportModel.strategyType = tradeData.J;
    this.mapExecutionReportEventToOrder(executionReportModel);
  }

  public mapExecutionReportEventToOrder(exeR: ExecutionReportModel) {
    let order = new NewOrderModel();
    order.binanceOrderId = exeR.orderId;
    order.clientOrderId = (exeR.clientOrderId || exeR.originalClientOrderId) as any as string;
    //order.orderBuySellId = (exeR.clientOrderId || exeR.originalClientOrderId) as any as string;
    order.cummulativeQuoteQty = exeR.cumulativeQuoteAsset;
    order.executedQty = exeR.cumulativeFilledQuantity;
    order.orderId = order.binanceOrderId = exeR.orderId;
    order.origQty = exeR.orderQuantity;
    order.price = exeR.orderPrice;
    order.side = exeR.side as Side;
    order.status = exeR.currentOrderStatus;
    order.strategyId = exeR.strategyId;
    order.strategyType = exeR.strategyType;
    order.symbol = exeR.symbol;
    order.timeInForce = exeR.timeInForce as TimeInForce;
    order.transactTime = exeR.transationTime?.toString();
    order.type = exeR.orderType as OrderType;
    order.isBuySellCompleted = (exeR.currentOrderStatus === 'Filled' || exeR.currentOrderStatus === 'Canceled')
    this.saveOrder(order);
  }

  public mapKindleCandleStickStreamData(data: any) {
    let kindle = new KlineCandleStickStreamData();
    let kData = new KlineData();
    kindle.eventTime = data.E;
    kindle.symbol = data.s;
    kindle.data = kData;

    kData.klineStartTime = data.t;
    kData.klineCloseTime = data.T;
    kData.symbol = data.S;
    kData.interval = data.i;
    kData.firstTradeId = data.f;
    kData.lastTradeId = data.L;
    kData.openPrice = data.o;
    kData.closePrice = data.c;
    kData.highPrice = data.h;
    kData.lowPrice = data.l;
    kData.baseAssetVolume = data.v;
    kData.numberOfTrades = data.n;
    kData.isKindleClosed = data.x;
    kData.quoteAssetVolume = data.q;
    kData.takeBuyQuoteAssetVolume = data.V;
    kData.takerBuyBaseAssetVolume = data.Q;

    return kindle;
  }

  public async getListeningKey() {
    let result = await firstValueFrom(this.httpClient.get<any>('http://localhost:26154/api/CoinSale/spotListenKey'));
    return result?.listenKey;
  }

  public async saveOrder(order: NewOrderModel) {
    let updatedOrderFromBinance = await firstValueFrom(
      this.httpClient.put<NewOrderModel>('http://localhost:26154/api/CoinSale/updateOrderToDB', order, { responseType: 'json'})
          .pipe(
           takeUntil(this.$destroySubscription)
         )
    )

    console.log('new Order model', order);
  }

}
