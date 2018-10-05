/*jshint esversion: 6 */

import Ticker from './Ticker' 
import CurrencyPair from './CurrencyPair' 

export default class ResModel {
  constructor() {
    this.usd = null;
    this.dailyTickers = new Map();
    this.recentTickers = new Map();
  }

  clone() {
    let newModel = new ResModel();
    newModel.usd = this.usd;
    newModel.dailyTickers = this.dailyTickers;
    newModel.recentTickers = this.recentTickers;
    return newModel;
  }

  getLastPrice(base, counter) {
    // if base and counter equal
    if(base.code === counter.code) {
      return 1;
    }

    if(counter === this.usd) {
      if(this.recentTickers.get(base) != null) {
        //console.log("Returning recent")
        //console.log(this.recentTickers.get(base).price);
        return this.recentTickers.get(base).price;
      }
      if(this.dailyTickers.get(base).slice(-1)[0] != null) {
        return this.dailyTickers.get(base).slice(-1)[0].price;
      }
    } else {
      if(this.dailyTickers.get(base).slice(-1)[0] != null && 
          this.dailyTickers.get(counter).slice(-1)[0] != null) {
        let baseUsd = this.dailyTickers.get(base).slice(-1)[0].price;
        let counterUsd = this.dailyTickers.get(counter).slice(-1)[0].price;
        return baseUsd / counterUsd;
      }
    }

    return 0;
  }

  // puts usd tickers at value 1 for all the timestamps in other
  calculateUsdTickers(other) {
    const usdTickers = [];
    const usd_usd = new CurrencyPair(this.usd, this.usd);
    for(let t of this.dailyTickers.get(other)) {
      usdTickers.push(new Ticker(usd_usd, 1, new Date(t.time.getTime())));
    }
    this.dailyTickers.set(this.usd, usdTickers);
    console.log("Usd tickers calculated. " + usdTickers.length + " USD tickers added.");
    //console.log(this.currencyTickers.get(this.usd))
  }

  findCurrencyByCode(code) {
    for (const key of this.dailyTickers.keys()) {
      if(key.code === code) {
        return key;
      }
    }
    return null;
  }
}

