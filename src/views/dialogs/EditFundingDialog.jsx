import CurrencyPair from "../../model/CurrencyPair";
import Transaction from "../../model/Transaction";
import CommonFundingDialog from "./CommonFundingDialog";
import ReactGA from 'react-ga';

class EditFundingDialog extends CommonFundingDialog {
  constructor(props) {
    super(props);
    this.state = {
      title: "Update funding",
      buttonText: "Update",
      editedTransaction: props.editedTransaction,
      isDeposit: props.editedTransaction.isBuy, 
      amount: props.editedTransaction.baseAmount.toString(),
      amountError: null,
      currency: this.getSelectObject(props.editedTransaction.pair.base),
      currencyError: null,
      currencies: props.editedTransaction.isBuy ? this.getDepositCurrencies() : this.getWithdrawalCurrencies(),
      date: props.editedTransaction.time,
      dateError: null,
      comment: props.editedTransaction.comment
    };

    // track ga
    console.log("Navigate to: " + window.location.pathname + "#/editFunding");
    ReactGA.modalview(window.location.pathname + '#/editFunding');
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    // old way, keeping it for now
    /*if(nextProps.editedTransaction != null) {
      this.setState({
        editedTransaction: nextProps.editedTransaction,
        isDeposit: nextProps.editedTransaction.isBuy, 
        amount: nextProps.editedTransaction.baseAmount.toString(),
        amountError: null,
        currency: this.getSelectObject(nextProps.editedTransaction.pair.base),
        currencyError: null,
        currencies: nextProps.editedTransaction.isBuy ? this.getDepositCurrencies() : this.getWithdrawalCurrencies(),
        date: nextProps.editedTransaction.time,
        dateError: null,
        comment: nextProps.editedTransaction.comment
      });
    }

    // track ga
    if(nextProps.isDialogShown === true) {
      ReactGA.modalview('/#/editFunding');
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

    if(this.isValidAmount(this.state.amount) &&
       this.isValidCurrency(this.state.currency) &&
       this.isValidDate(this.state.date)) {
      console.log("All inputs valid. Saving funding.."); 

      let pair = new CurrencyPair(this.state.currency.value, this.props.resModel.usd);
      let tx = new Transaction(false, this.state.isDeposit, pair, parseFloat(this.state.amount), 0, this.state.date, this.state.comment);
      this.props.updateTransaction(tx);
      this.props.hideDialog();
    }
  }
 
}

export default EditFundingDialog;
