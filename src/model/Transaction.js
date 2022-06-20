/*jshint esversion: 6 */
//import { resModel } from "./init/ResModelInit.js";
import { formatUtils } from './../utils/FormatUtils';

export default class Transaction {
  constructor(isTrade, isBuy, pair, baseAmount, counterAmount, time, comment) {
    this.isTrade = isTrade; // trade or funding
    this.isBuy = isBuy; // buy or sell
    this.pair = pair;
    this.baseAmount = baseAmount;
    this.counterAmount = counterAmount;
    this.time = time;
    this.comment = comment;
  }

  getPrice() {
    if(this.baseAmount > 0) {
      return this.counterAmount / this.baseAmount; 
    }

    return 0;
  }

  getProfit(resModel, denomination) {
    let priceThen = this.getPrice();
    let priceNow = resModel.getLastPrice(this.pair.base, this.pair.counter);
    let profit = this.baseAmount * (priceNow - priceThen) * (this.isBuy ? 1 : -1);

    if(this.pair.counter !== denomination) {
      let lastPrice = resModel.getLastPrice(this.pair.counter, denomination);
      profit = profit * lastPrice;
    }

    return profit;
  }

  getProfitPercent(resModel) {
    let priceThen = this.getPrice();
    let priceNow = resModel.getLastPrice(this.pair.base, this.pair.counter);
   
    if(priceThen !== 0) {
      return (priceNow - priceThen) / priceThen * 100 * (this.isBuy ? 1 : -1);
    }

    return 0;
  }

  toShortString() {
		let base = "";
		if(this.isTrade) {
      let tradeType = this.isBuy ? "buy" : "sell";
      base += tradeType + " " + formatUtils.formatNumber(this.baseAmount, 2) + this.pair.base.code + " @ " ;
      base += formatUtils.formatNumber(this.getPrice(), 6)+ this.pair.counter.code;
    } else {
      let tradeType = this.isBuy ? "deposit" : "withdrawal";
			base += tradeType + " " + formatUtils.formatNumber(this.baseAmount, 2) + this.pair.base.code;
		}
		
		return base;
	}
}