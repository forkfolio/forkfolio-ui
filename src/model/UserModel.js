/*jshint esversion: 6 */
import Portfolio from './Portfolio';
import { dateUtils } from './../utils/DateUtils';


export default class UserModel {
  constructor(transactions = [], positions = [], resModel) {
    this.transactions = transactions;
    this.positions = positions;
    this.portfolios = [];

    this.preparePortfolios(resModel);
  }

  updateTransactions(transactions, resModel) {
    this.transactions = transactions;
    this.portfolios = [];
    this.preparePortfolios(resModel);
  }

  preparePortfolios(resModel) {
    //console.log("Preparing portfolios..");
    let empty = new Portfolio(null, null);
    empty.sortBalances(resModel);
    this.portfolios.push(empty);

    let previous = empty;
    for(let tx of this.transactions) {
      let portfolio = new Portfolio(previous, tx);
      portfolio.sortBalances(resModel);
      this.portfolios.push(portfolio);
      previous = portfolio;
    } 
  }

  // returns all portfolios created after date
  getPortfoliosSince(date) {
    let selected = [];
    for(let p of this.portfolios) {
      if(p.genesisTx !== null && p.genesisTx.isTrade) {
        if(p.genesisTx.time.getTime() > date.getTime() || p === this.portfolios[this.portfolios.length - 1]) {
          selected.push(p);
        }
      }
    }

    // always add the one before the first one
    if(selected.length > 0) {
      selected.unshift(selected[0].previous);
    }

    return selected;
  }

  getDaysSinceFirstTx() {
    if(this.transactions.length > 0) {
      let firstDate = new Date(this.transactions[0].time);
      return dateUtils.getDaysSince(firstDate);
    }

    return 0;
  }
}
