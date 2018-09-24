import CurrencyPair from "../../model/CurrencyPair"
import Transaction from "../../model/Transaction"
import CommonFundingDialog from "./CommonFundingDialog";

class EditFundingDialog extends CommonFundingDialog {
  constructor(props) {
    super(props);
    this.state = {
      title: "Update funding",
    };
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    if(nextProps.editedTransaction != null) {
      this.setState({
        editedTransaction: nextProps.editedTransaction,
        type: nextProps.editedTransaction.isBuy ? {value: true, label: "Deposit"} : {value: false, label: "Withdrawal"}, 
        typeError: null,
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
  }

  getSelectObject(currency) {
    return { 
      value: currency, 
      label: currency.code + " - " + currency.name 
    };
  }

  handleSaveButtonClick() {
    console.log("Validating input..");

    if(this.isValidType(this.state.type) &&
       this.isValidAmount(this.state.amount) &&
       this.isValidCurrency(this.state.currency) &&
       this.isValidDate(this.state.date)) {
      console.log("All inputs valid. Saving funding.."); 

      let pair = new CurrencyPair(this.state.currency.value, this.props.resModel.usd);
      let tx = new Transaction(false, this.state.type.value, pair, parseFloat(this.state.amount), 0, this.state.date, this.state.comment);
      this.props.updateTransaction(tx);
      this.props.hideDialog();
    }
  }
 
}

export default EditFundingDialog;
