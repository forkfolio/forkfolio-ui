import CurrencyPair from "../../model/CurrencyPair";
import Transaction from "../../model/Transaction";
import CommonTradeDialog from "./CommonTradeDialog";
import ReactGA from 'react-ga';

class AddTradeDialog extends CommonTradeDialog {
  constructor(props) {
    super(props);
    this.state = this.getInitialState(props);

    console.log("Navigate to: " + window.location.pathname + "/#/addTrade");
    ReactGA.modalview(window.location.pathname + '/#/addTrade');
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    // track ga
    /*if(nextProps.isDialogShown === true) {
      ReactGA.modalview('/#/addTrade');
    }*/
  }

  getInitialState(nextProps) {
    return {
      isDialogShown: nextProps.isDialogShown,
      title: "Add trade",
      buttonText: "Add",
      buyAmount: "",
      buyAmountError: null,
      buyCurrency: null,
      buyCurrencyError: null,
      sellAmount: "",
      sellAmountError: null,
      sellCurrency: null,
      sellCurrencyError: null,
      date: new Date(),
      dateError: null,
      comment: "",
      buyCurrencies: this.getBuyCurrencies(nextProps),
      sellCurrencies: this.getSellCurrencies(nextProps),
    }
  }

  getPair(buyCurrency, sellCurrency, buyAmount, sellAmount) {
    let buyRank = buyCurrency.rank + (buyCurrency.isFiat ? -1000000 : 0);
    let sellRank = sellCurrency.rank + (sellCurrency.isFiat ? -1000000 : 0);
    // reverse if needed for ranks, or in special case where ETH/ETH and 0
    if(buyRank < sellRank || (buyRank === sellRank && buyAmount === 0)) {
      return {
        pair: new CurrencyPair(sellCurrency, buyCurrency),
        isBuy: false,
        buyAmount: sellAmount,
        sellAmount: buyAmount
      }
    }

    return {
      pair: new CurrencyPair(buyCurrency, sellCurrency),
      isBuy: true,
      buyAmount: buyAmount,
      sellAmount: sellAmount
    }
  }

  handleSaveButtonClick() {
    console.log("Validating input..");

    if(this.isValidBuyAmount(this.state.buyAmount) &&
       this.isValidBuyCurrency(this.state.buyCurrency) &&
       this.isValidSellAmount(this.state.sellAmount) &&
       this.isValidSellCurrency(this.state.sellCurrency) &&
       this.isValidDate(this.state.date)) {
      console.log("All inputs valid. Saving trade.."); 
      

      let pairBuy = this.getPair(this.state.buyCurrency.value, this.state.sellCurrency.value, parseFloat(this.state.buyAmount), parseFloat(this.state.sellAmount));
      let pair = pairBuy.pair;
      let isBuy = pairBuy.isBuy;
      let buyAmount = pairBuy.buyAmount;
      let sellAmount = pairBuy.sellAmount;

      let tx = new Transaction(true, isBuy, pair, buyAmount, sellAmount, this.state.date, this.state.comment);
      this.props.addTransaction(tx);
      this.setState(this.getInitialState(this.props));
      this.props.hideDialog();
    }
  }
}

export default AddTradeDialog;