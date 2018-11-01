/*jshint esversion: 6 */
//import { resModel } from "./init/ResModelInit.js";

export default class Portfolio {
    constructor(previous, genesisTx) {
      this.previous = previous;
      this.genesisTx = genesisTx;
      this.balances = new Map();
      this.tradeCount = this.calculateTradeCount();

      this.calculateCurrencyBalances();
    }

    calculateTradeCount() {
        let count = this.previous != null ? this.previous.tradeCount : 0;
        if(this.genesisTx != null && this.genesisTx.isTrade) {
            count++;
        }
        return count;
    }

    calculateCurrencyBalances() {
        if(this.previous !== null) {
            this.balances = new Map(this.previous.balances);
        }
        if(this.genesisTx !== null) {
            // add usd to balances only if not funding
            let isNotFunding = this.genesisTx.pair.counter.code !== 'USD' || 
            (this.genesisTx.pair.counter.code === 'USD' && this.genesisTx.isTrade);

            // if no base and counter in map, add them first
            if(this.balances.get(this.genesisTx.pair.base) === undefined) {
                this.balances.set(this.genesisTx.pair.base, 0);
            }
            if(this.balances.get(this.genesisTx.pair.counter) === undefined) {
                if(isNotFunding) {
                    this.balances.set(this.genesisTx.pair.counter, 0);
                }
            }

            // then do the calculation
            if(this.genesisTx.isBuy) {
                //  add base and subtract counter
                this.balances.set(this.genesisTx.pair.base, this.balances.get(this.genesisTx.pair.base) + this.genesisTx.baseAmount);
                if(isNotFunding) {
                    this.balances.set(this.genesisTx.pair.counter, this.balances.get(this.genesisTx.pair.counter) - this.genesisTx.counterAmount);
                }
            } else {
                //  subtract base and add counter
                this.balances.set(this.genesisTx.pair.base, this.balances.get(this.genesisTx.pair.base) - this.genesisTx.baseAmount);
                if(isNotFunding) {
                    this.balances.set(this.genesisTx.pair.counter, this.balances.get(this.genesisTx.pair.counter) + this.genesisTx.counterAmount);
                }
            }            
        }
    }

    sortBalances(resModel) {
        this.balances = new Map([...this.balances.entries()].sort(
            (a, b) => this.getCurrencyBalance(resModel, b[0], resModel.usd) - this.getCurrencyBalance(resModel, a[0], resModel.usd)            
        ));
    }

    getCurrencyBalance(resModel, currency, denomination) {
        let priceInDenomination = 1;
        if(currency !== denomination) {
            let lastPrice = resModel.getLastPrice(currency, denomination);
            if(lastPrice !== null) {
                priceInDenomination = lastPrice;
            }
        }

        return this.balances.get(currency) * priceInDenomination;
    }

    getTotalBalance(resModel, denomination) {
        let totalBalance = 0;
        for (const k of this.balances.keys()) {
            totalBalance += this.getCurrencyBalance(resModel, k, denomination);
        }

        return totalBalance;
    }

    getTotalCryptoBalance(resModel, denomination) {
        let totalBalance = 0;
        for (const k of this.balances.keys()) {
            if(!k.isFiat) {
                totalBalance += this.getCurrencyBalance(resModel, k, denomination);
            }
        }

        return totalBalance;
    }

    // returns balance of the currency on a date
    getPastBalance(currency, date) {
        let currencyBalance = 0;
        if(this.genesisTx !== null) {
            // if portfolio is created before timepoint, use it's balances
            if(this.genesisTx.time.getTime() < date.getTime()) {
                // if time point is after portfolio creation date, then use this portfolio's balance 
                currencyBalance = this.balances.get(currency);
            } else {
                let pastPortfolio = this.getPastPortfolio(date);
                if(pastPortfolio !== null) {
                    currencyBalance = pastPortfolio.balances.get(currency);
                    if(currencyBalance == null) {
                        currencyBalance = 0
                    }
                }
            }
        } else {
            console.log("Get past balance called for portfolio without genesis trade (first portfolio). Returning 0.");
        }

        return currencyBalance;
    }
    // returns portfolio was current at date
    getPastPortfolio(date) {
        let prev = this.previous;
        while(prev !== null) {
            if(prev.genesisTx == null || prev.genesisTx.time.getTime() < date.getTime()) {
                return prev;
            }
            prev = prev.previous;
        }

        return null;
    }
  }