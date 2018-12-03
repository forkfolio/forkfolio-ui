/*jshint esversion: 6 */
import React  from 'react';

class FormatUtils {
  formatNumber(value, digits) {
    if (value != null) {
      return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }

    return "0";
  }

  toShortFormat(balance) {
    let short = balance;
    let adder = "";
    if(balance > 10000000000) {
      short = balance / 1000000000;
      adder = "B";
    } else if(balance > 10000000) {
      short = balance / 1000000;
      adder = "M";
    } else if(balance > 10000) {
      short = balance / 1000;
      adder = "K";
    }

    // special case if portfolio is negative
    if(balance < 0) {
      let value = formatUtils.formatNumber(short, 2) + adder;
      return "-$" + value.slice(1, value.length);
    }

    return "$" + formatUtils.formatNumber(short, 2) + adder;
  }

  toGreenRedPercentStyle(value) {
    let style1 = "font-" + (value >= 0 ? "green" : "red" );
    style1 = Math.abs(value) < 0.001 ? "" : style1;
    return (
      <div className={style1}>
        {formatUtils.formatNumber(value, 2) + "%"}
      </div>
    );
  }

  getNoDataText(name, userModel) {
    let currentPortfolio = userModel.portfolios.slice(-1)[0];
    if(currentPortfolio.tradeCount === 0) {
      // if there are no trades, and no fundings
      if(userModel.transactions.length === 0) {
        return (<span><p>Your portfolio is empty. To get started:</p>
          <ol>
            <li>navigate to the Funding page,</li>
            <li>click on the Add Funding button,</li>
            <li>add your first deposit.</li>
         </ol>
         </span>);
      } 

      return (<span>No {name} found</span>)
    }
  }
}

export let formatUtils = new FormatUtils();