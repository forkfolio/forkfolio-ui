import CurrencyPair from "../../model/CurrencyPair";
import Transaction from "../../model/Transaction";
import CommonTradeDialog from "./CommonTradeDialog";

class AddTradeDialog extends CommonTradeDialog {
  constructor(props) {
    super(props);
    this.state = {
      title: "Add trade",
      buyAmount: "",
      buyAmountError: null,
      buyCurrency: null,
      buyCurrencyError: null,
      sellAmount: "",
      sellAmountError: null,
      sellCurrency: null,
      sellCurrencyError: null,
      dateError: null,
      comment: null
    };
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    this.setState({
      buyCurrencies: this.getBuyCurrencies(),
      sellCurrencies: this.getSellCurrencies(),
      date: new Date(),
    });
  }

  getPair(buyCurency, sellCurrency, buyAmount, sellAmount) {
    let buyRank = buyCurency.rank + (buyCurency.isFiat ? -1000000 : 0);
    let sellRank = sellCurrency.rank + (sellCurrency.isFiat ? -1000000 : 0);
    // reverse if needed for ranks, or in special case where ETH/ETH and 0
    if(buyRank < sellRank || (buyRank === sellRank && buyAmount === 0)) {
      return {
        pair: new CurrencyPair(sellCurrency, buyCurency),
        isBuy: false,
        buyAmount: sellAmount,
        sellAmount: buyAmount
      }
    }

    return {
      pair: new CurrencyPair(buyCurency, sellCurrency),
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
      this.props.hideDialog();
    }
  }
}

export default AddTradeDialog;