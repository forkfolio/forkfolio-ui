/*jshint esversion: 6 */

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
      // counter usd, there is recent base
      if(this.recentTickers.get(base.code) != null) {
        return this.recentTickers.get(base.code).price;
      }
      // counter usd, there is no recent base
      if(this.dailyTickers.get(base).slice(-1)[0] != null) {
        return this.dailyTickers.get(base).slice(-1)[0].price;
      }
    } else {
      // counter not usd, there is recent base
      if(this.recentTickers.get(base.code) != null && 
          this.recentTickers.get(counter) != null) {
        let baseUsd = this.recentTickers.get(base.code).price;
        let counterUsd = this.recentTickers.get(counter.code).price;
        return baseUsd / counterUsd;
      }

      // counter not usd, there is no recent base
      if(this.dailyTickers.get(base).slice(-1)[0] != null && 
          this.dailyTickers.get(counter).slice(-1)[0] != null) {
        let baseUsd = this.dailyTickers.get(base).slice(-1)[0].price;
        let counterUsd = this.dailyTickers.get(counter).slice(-1)[0].price;
        return baseUsd / counterUsd;
      }
    }

    return 0;
  }

  getPercentChange24h(currency) {
    if(this.recentTickers.get(currency) != null) {
      return this.recentTickers.get(currency).percentChange24h;
    }

    return 0;
  }

  sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  // returns the price of base denominated in counter on date
  getPastPrice(base, counter, date) {
    // if base and counter equal
    if(base.code === counter.code) {
      return 1;
    }

    if(counter === this.usd) {
      for(let t of this.dailyTickers.get(base)) {
        if(this.sameDay(date, t.time)) {
          return t.price;
        }
      }
    } else {
      // counter not usd, there is recent base
      // not implemented for now
    }

    return 0;
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

