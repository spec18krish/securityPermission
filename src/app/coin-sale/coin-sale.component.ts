import { CoinMarketInfo } from './../model/coin-market-info';
import { TimeInForce } from './../enum/time-in-force';
import { AccountInfo } from './../model/account-info-model';
import { NewOrderModel } from './../model/new-order-mode';
import { PriceHistoryModel } from './../model/price-history-model';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { OrderRequest } from '../model/order-request';
import { Side } from '../enum/side';
import { catchError, firstValueFrom, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-coin-sale',
  templateUrl: './coin-sale.component.html',
  styleUrls: ['./coin-sale.component.scss']
})
export class CoinSaleComponent implements OnInit {

  coinSaleData: PriceHistoryModel[] = [];
  orderData: NewOrderModel[] = [];
  currentOrders!: CoinMarketInfo[];
  hasExistingOrder: boolean = false;
  cycleCompleted = true;
  holdProcessing = true;
  amountOfCoinsToTrade = undefined;
  maximumOrderQuantity = '';
  minimumOrderQuantity = '';
  maximumBuyPrice = '';
  minimumBuyPrice = '';
  accountInfo!: AccountInfo;
  $destroySubscription: Subject<boolean> = new  Subject<boolean>();

  symbol = 'TRX';
  symbolCurrency = 'TRXBUSD'; //'DOGEBUSD'
  tradingCurrency = 'BUSD';
  symbolCurrencyBalance: string = '';
  tradingCurrencyBalance: string = '';
  expectedMinimumProfit = 0;
  exchangeInfo: any = undefined;
  currentStatus: 'Waiting to Buy' | 'Waiting to Sell' | 'Error Occured' | 'On Hold' = 'On Hold';
  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getExchangeInfo();
  }

  public initialize() {
    setInterval(() =>{
    if (this.cycleCompleted && !this.holdProcessing) {
        this.getAccountInfo();
        this.cycleCompleted = false;
    }
    }, 1000)
  }

  getExchangeInfo() {
    this.httpClient.get<AccountInfo>('http://localhost:26154/api/CoinSale/exchangeInfo', {params: {symbol: this.symbolCurrency}})
    .pipe(
      takeUntil(this.$destroySubscription)
    )
    .subscribe(s => {
      this.exchangeInfo = s;

      let filters = this.exchangeInfo?.symbols?.find((f: any) => f.symbol === this.symbolCurrency)?.filters;
      let lotSizeFilter = filters?.find((f: any) => f.filterType === "LOT_SIZE");
      let priceFilters = filters?.find((f: any) => f.filterType === "PRICE_FILTER");

      this.maximumOrderQuantity = lotSizeFilter?.maxQty;
      this.minimumOrderQuantity = lotSizeFilter?.minQty;

      this.maximumBuyPrice = priceFilters?.maxPrice;
      this.minimumBuyPrice = priceFilters?.minPrice;

      this.initialize();
    });
  }


  getAccountInfo() {
    this.httpClient.get<AccountInfo>('http://localhost:26154/api/CoinSale/accountInfo', {params: {symbol: this.symbol}})
    .pipe(
      takeUntil(this.$destroySubscription)
    )
    .subscribe(s => {
     this.accountInfo = s;
     this.symbolCurrencyBalance = this.accountInfo?.balances?.find(f => f.asset === this.symbol)?.free?.toString() ?? '';
     this.tradingCurrencyBalance = this.accountInfo?.balances?.find(f => f.asset === this.tradingCurrency)?.free?.toString() ?? '';
     this.getCoinSale();
    });
  }

  public completeTheCycle() {
    this.$destroySubscription.next(true);
    this.cycleCompleted = true;
    return;
  }

  getCoinSale() {
    let params = {params: {symbol: this.symbolCurrency}};
    this.httpClient
        .get<PriceHistoryModel>('http://localhost:26154/api/CoinSale/marketState',params)
        .pipe(
          takeUntil(this.$destroySubscription)
        )
        .subscribe(s => {
          const openDate = new Date(s.openTime as any as number);
          const closeDate = new Date(s.closeTime as any as number);

          s.openTime = moment(openDate).format("hh:mm:ss A");
          s.closeTime = moment(closeDate).format("hh:mm:ss A");
          this.coinSaleData.unshift(s);

          if (this.coinSaleData?.length > 20) {
            this.coinSaleData.pop();
          }

          this.coinSaleData = [...this.coinSaleData];
          this.getCurrentOrder(s);
        })
  }

  getCurrentOrder(priceHistory: PriceHistoryModel) {
    let params = {params: {symbol: this.symbolCurrency}};
    this.httpClient.get<CoinMarketInfo[]>('http://localhost:26154/api/CoinSale/currentOrder', params)
        .pipe(
          takeUntil(this.$destroySubscription)
        )
        .subscribe(s => {
          this.currentOrders = s;
          this.processBuyOrder(priceHistory);
        });
  }

  processBuyOrder(priceHistory: PriceHistoryModel) {
    let totalAvailableUSDCoins = this.accountInfo.balances.find(f => f.asset === this.tradingCurrency)?.free ?? 0;
    let currentCoinBuyOrder = this.currentOrders?.find(f => f.symbol === this.symbolCurrency && f.side === Side.BUY);
    let currentCoinSellOrder = this.currentOrders?.find(f => f.symbol === this.symbolCurrency && f.side === Side.SELL);
    let hasExistingBuyOrder = currentCoinBuyOrder && currentCoinBuyOrder?.orderId ? true : false;
    let hasExistingSellOrder = currentCoinSellOrder && currentCoinSellOrder?.orderId ? true : false;

    let availableCoinsToBuy =   totalAvailableUSDCoins / priceHistory.lowPrice;

    // if there is already an existing order then don't buy
    if (hasExistingBuyOrder || hasExistingSellOrder){
        return this.processSellOrder(priceHistory);
    }

    if (!priceHistory || priceHistory?.highPrice === 0 || priceHistory?.lastPrice === 0 || priceHistory?.lowPrice === 0) {
        return this.completeTheCycle();
    }

    let hasSamePrice = false; // priceHistory?.highPrice === priceHistory?.lowPrice;

    // if it does not have minimum profit then we don't buy
    let estimatedProfit = ((priceHistory.highPrice * availableCoinsToBuy) - (priceHistory.lowPrice * availableCoinsToBuy));
    let hasMinimumProfit = estimatedProfit >= this.expectedMinimumProfit;
    if (hasMinimumProfit && !hasSamePrice){
       this.makeBuyOrder(priceHistory);
    }
    else {
      this.processSellOrder(priceHistory);
    }
  }

  makeBuyOrder(priceHistory: PriceHistoryModel) {
    let coinAsset = this.accountInfo.balances.find(f => f.asset === this.symbol);
    let usdAsset = this.accountInfo.balances.find(f => f.asset === 'BUSD');

    let availableCoins = coinAsset?.free || 0;
    let availableusdt = usdAsset?.free || 0;
    let availableCoinsToBuy =   (+availableusdt.toFixed(0) / +priceHistory.lowPrice).toFixed(0);
    //let hasMoneyToBuy = availableusdt >= (availableCoins * priceHistory.lowPrice); // not sure why I did this
    let hasMoneyToBuy = availableusdt >= (+this.minimumOrderQuantity * priceHistory.lowPrice);

    let canBuyOrder = availableusdt > 0 && hasMoneyToBuy && +availableCoinsToBuy > 0 && +availableCoinsToBuy > +this.minimumOrderQuantity;

    let coinsQtyToBuy = this.amountOfCoinsToTrade ||
                        (+this.maximumOrderQuantity >= +availableCoinsToBuy) ? +availableCoinsToBuy : +this.maximumOrderQuantity;

    if (canBuyOrder) {
        let params: OrderRequest = {
          symbol: this.symbolCurrency,
          quantity: +coinsQtyToBuy || 0,
          price: priceHistory.lowPrice,
          clientOrderId: Date.now().toString(),
      };

      this.httpClient.post<NewOrderModel[]>('http://localhost:26154/api/CoinSale/buyOrder', params, { responseType: 'json'})
          .pipe(
            takeUntil(this.$destroySubscription)
          )
          .subscribe({
            next: (s) => { this.processSellOrder(priceHistory); },
            error: (err) => { this.processSellOrder(priceHistory); },
            complete: () => {},
          });
    }
    else {
      this.processSellOrder(priceHistory)
    }
  }

  public async getFilledBuyOrder() {
    let params = {params: {symbol: this.symbolCurrency}};

    return await firstValueFrom(
      this.httpClient.get<NewOrderModel>('http://localhost:26154/api/CoinSale/recentBuyOrder', params)
          .pipe(
           takeUntil(this.$destroySubscription)
         )
    )
  }

  public async processSellOrder(priceHistory: PriceHistoryModel) {
    let totalAvailableCoinsToSell = this.accountInfo.balances.find(f => f.asset === this.symbol)?.free ?? 0;

    let currentCoinBuyOrder = this.currentOrders?.find(f => f.symbol === this.symbolCurrency && f.side === Side.BUY);
    let currentCoinSellOrder = this.currentOrders?.find(f => f.symbol === this.symbolCurrency && f.side === Side.SELL);
    let hasExistingSellOrder = currentCoinSellOrder && currentCoinSellOrder?.orderId ? true : false;
    let hasExistingBuyOrder = currentCoinBuyOrder && currentCoinBuyOrder?.orderId ? true : false;
    let currentUSDBalance = this.accountInfo.balances.find(f => f.asset === this.tradingCurrency)?.free ?? 0;
    let hasMinimumUSDBalance = currentUSDBalance > +this.minimumBuyPrice;
    let costPrice = 0;
    let totalCostPrice = 0;
    // if there is already an existing order or there is no coind to sell then don't buy
    if (totalAvailableCoinsToSell <= 0 || hasExistingSellOrder){
        return this.completeTheCycle();
    }

     let filledOrder = await this.getFilledBuyOrder();

    //  if (!filledOrder && hasMinimumUSDBalance)
    //  {
    //   return this.completeTheCycle();
    //  }

     if (filledOrder) {
      costPrice = filledOrder?.price;
      totalCostPrice = filledOrder?.price * filledOrder?.executedQty;
     }

    //let costPrice = currentCoinBuyOrder?.price * (currentCoinBuyOrder?.executedQty ?? 0);

    // if cost price is less then current high price then don't sell it.
    if (priceHistory?.highPrice <= costPrice) {
       return this.completeTheCycle();
    }


    // if it does not have minimum profit then we don't buy
    let estimatedProfit = ((priceHistory.highPrice * totalAvailableCoinsToSell) - costPrice * totalAvailableCoinsToSell);
    let hasMinimumProfit = estimatedProfit >= this.expectedMinimumProfit;
    if (!hasMinimumProfit){
       return this.completeTheCycle();
    }

    this.makeSellOrder(priceHistory, filledOrder);
  }

  public makeSellOrder(priceHistory: PriceHistoryModel, buyOrderDetail: NewOrderModel) {
    let coinAsset = this.accountInfo.balances.find(f => f.asset === this.symbol);
    let usdAsset = this.accountInfo.balances.find(f => f.asset === 'BUSD');

    let totalAvailableCoinsToSell = coinAsset?.free || 0;

    let canSellOrder = totalAvailableCoinsToSell > 0  && totalAvailableCoinsToSell > +this.minimumOrderQuantity;

    let coinsQtyToSell = this.amountOfCoinsToTrade || (+this.maximumOrderQuantity >= totalAvailableCoinsToSell) ? totalAvailableCoinsToSell : this.maximumOrderQuantity;

    let params: OrderRequest = {
        symbol: this.symbolCurrency,
        quantity: +coinsQtyToSell,
        price: priceHistory.highPrice,
        clientOrderId: buyOrderDetail?.clientOrderId?.toString() ?? Date.now().toString(),
    };

    if (canSellOrder) {
      this.httpClient.post<NewOrderModel[]>('http://localhost:26154/api/CoinSale/sellOrder', params, { responseType: 'json'})
        .pipe(
          takeUntil(this.$destroySubscription)
        )
        .subscribe({
          next: (s) => { this.completeTheCycle(); },
          error: (err) => { this.completeTheCycle(); },
          complete: () => { this.completeTheCycle(); },
        });
      }
      else {
        this.completeTheCycle();
      }
  }

  public cancelCurrentOrder(data: CoinMarketInfo) {
    let params = { params: { symbol: data.symbol, binanceOrderId: data.orderId, clientOrderId: data.clientOrderId } };

    this.httpClient
      .delete<NewOrderModel[]>(
        'http://localhost:26154/api/CoinSale/cancelOrder',
        params
      )
      .pipe(takeUntil(this.$destroySubscription))
      .subscribe({
        next: (s) => {
          this.completeTheCycle();
        },
        error: (err) => {
          this.completeTheCycle();
        },
        complete: () => {
          this.completeTheCycle();
        },
      });
  }

  public cancelOrder() {

    let params = {params: {symbol: this.symbolCurrency}};

          this.httpClient.get<NewOrderModel[]>('http://localhost:26154/api/CoinSale/cancelAllOpenOrder', params)
      .pipe(
        takeUntil(this.$destroySubscription)
      )
      .subscribe({
        next: (s) => { this.completeTheCycle(); },
        error: (err) => {this.completeTheCycle(); },
        complete: () => {this.completeTheCycle(); },
      });

    // let params = {params: {symbol: this.symbolCurrency, binanceOrderId : 0, clientOrderId: '0'}};

    // let currentBuyOrder = this.currentOrders?.find(f => f.symbol === this.symbolCurrency && f.side === Side.BUY);
    // let currentSellOrder = this.currentOrders?.find(f => f.symbol === this.symbolCurrency && f.side === Side.SELL);

    // if (currentBuyOrder) {
    //   params.params.binanceOrderId = currentBuyOrder.binanceOrderId;
    //   params.params.clientOrderId = currentBuyOrder.clientOrderId;
    //   this.httpClient.get<NewOrderModel[]>('http://localhost:26154/api/CoinSale/cancelOrder', params)
    //   .pipe(
    //     takeUntil(this.$destroySubscription)
    //   )
    //   .subscribe({
    //     next: (s) => { this.completeTheCycle(); },
    //     error: (err) => {this.completeTheCycle(); },
    //     complete: () => {this.completeTheCycle(); },
    //   });
    // }

    // if (currentSellOrder) {
    //   params.params.binanceOrderId = currentSellOrder.binanceOrderId;
    //   params.params.clientOrderId = currentSellOrder.clientOrderId;
    //   this.httpClient.get<NewOrderModel[]>('http://localhost:26154/api/CoinSale/cancelOrder', params)
    //   .pipe(
    //     takeUntil(this.$destroySubscription)
    //   )
    //   .subscribe({
    //     next: (s) => { this.completeTheCycle(); },
    //     error: (err) => {this.completeTheCycle(); },
    //     complete: () => {this.completeTheCycle(); },
    //   });
    // }

  }

  public onHoldProcessing() {
    this.holdProcessing = !this.holdProcessing;
  }

}
