import "react-select/dist/react-select.css";

import CurrencyPair from "../../model/CurrencyPair"
import Transaction from "../../model/Transaction"
import CommonFundingDialog from "./CommonFundingDialog";
import ReactGA from 'react-ga';

class AddFundingDialog extends CommonFundingDialog {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();

    ReactGA.modalview('/#/addFunding');
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    // old way, keeping it for now
    /*this.setState(this.getInitialState());

    // track ga
    if(nextProps.isDialogShown === true) {
      ReactGA.modalview('/#/addFunding');
    }*/
  }

  getInitialState() {
    return {
      title: "Add funding",
      buttonText: "Add",
      isDeposit: true,
      amount: "",
      amountError: null,
      currency: null,
      currencyError: null,
      date: new Date(),
      dateError: null,
      comment: null,
      currencies: this.getDepositCurrencies()
    }
  }

  handleSaveButtonClick() {
    console.log("Validating input..");

    if(this.isValidAmount(this.state.amount) &&
       this.isValidCurrency(this.state.currency) &&
       this.isValidDate(this.state.date)) {
      console.log("All inputs valid. Saving funding.."); 

      let pair = new CurrencyPair(this.state.currency.value, this.props.resModel.usd);
      // TODO not always isBuy = true
      let tx = new Transaction(false, this.state.isDeposit, pair, parseFloat(this.state.amount), 0, this.state.date, this.state.comment);
      this.props.addTransaction(tx);
      this.props.hideDialog();
    }
  }
}

export default AddFundingDialog;
