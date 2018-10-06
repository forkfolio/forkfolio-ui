/*jshint esversion: 6 */
import React  from 'react';

class FormatUtils {
  formatNumber(value, digits) {
    if (value != null) {
      return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }

    return "0";
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