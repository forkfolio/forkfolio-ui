import CurrencyPair from "../../model/CurrencyPair";
import Transaction from "../../model/Transaction";
import CommonTradeDialog from "./CommonTradeDialog";
import ReactGA from 'react-ga';

class EditTradeDialog extends CommonTradeDialog {
  constructor(props) {
    super(props);
    this.state = {
      title: "Update trade",
      buttonText: "Update",
      editedTransaction: props.editedTransaction,
      buyAmount: props.editedTransaction.baseAmount.toString(),
      buyAmountError: null,
      buyCurrency: this.getSelectObject(props.editedTransaction.pair.base),
      buyCurrencyError: null,
      buyCurrencies: this.getBuyCurrencies(props),
      sellAmount: props.editedTransaction.counterAmount.toString(),
      sellAmountError: null,
      sellCurrency: this.getSelectObject(props.editedTransaction.pair.counter),
      sellCurrencyError: null,
      sellCurrencies: this.getSellCurrencies(props),
      date: props.editedTransaction.time,
      dateError: null,
      comment: props.editedTransaction.comment
    };

    ReactGA.modalview('/#/editTrade');
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    // old way, keeping it for now
    /*if(nextProps.editedTransaction != null) {
      this.setState({
        editedTransaction: nextProps.editedTransaction,
        buyAmount: nextProps.editedTransaction.baseAmount.toString(),
        buyAmountError: null,
        buyCurrency: this.getSelectObject(nextProps.editedTransaction.pair.base),
        buyCurrencyError: null,
        buyCurrencies: this.getBuyCurrencies(nextProps),
        sellAmount: nextProps.editedTransaction.counterAmount.toString(),
        sellAmountError: null,
        sellCurrency: this.getSelectObject(nextProps.editedTransaction.pair.counter),
        sellCurrencyError: null,
        sellCurrencies: this.getSellCurrencies(nextProps),
        date: nextProps.editedTransaction.time,
        dateError: null,
        comment: nextProps.editedTransaction.comment
      });
    }

    // track ga
    if(nextProps.isDialogShown === true) {
      ReactGA.modalview('/#/editTrade');
    }*/
  }

  getSelectObject(currency) {
    return { 
      value: currency, 
      label: currency.code
    };
  }

  handleSaveButtonClick() {
    console.log("Validating input..");

    if(this.isValidBuyAmount(this.state.buyAmount) &&
       this.isValidBuyCurrency(this.state.buyCurrency) &&
       this.isValidSellAmount(this.state.sellAmount) &&
       this.isValidSellCurrency(this.state.sellCurrency) &&
       this.isValidDate(this.state.date)) {
      console.log("All inputs valid. Saving trade.."); 

      let pair = new CurrencyPair(this.state.buyCurrency.value, this.state.sellCurrency.value);
      let tx = new Transaction(true, this.state.editedTransaction.isBuy, pair, parseFloat(this.state.buyAmount), parseFloat(this.state.sellAmount), this.state.date, this.state.comment);
      this.props.updateTransaction(tx);
      this.props.hideDialog();
    }
  }
}

export default EditTradeDialog;