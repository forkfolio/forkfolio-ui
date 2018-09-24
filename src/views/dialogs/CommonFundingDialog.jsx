import React, { Component } from "react";
import Select from "react-select";
import "react-select/dist/react-select.css";

import Datetime from "react-datetime";

import {
  Grid,
  Row,
  Col,
  Modal,
  Form,
  FormGroup,
  FormControl,
  ControlLabel
} from "react-bootstrap";

import Button from "components/CustomButton/CustomButton.jsx";

class CommonFundingDialog extends Component {

  isValidType(value) {
    let isInvalid = value == null;
    isInvalid ? this.setState({
      typeError: (
        <small className="text-danger">
          Please select deposit or withdrawal.
        </small>)
    })
      : this.setState({ typeError: null });
    return !isInvalid;
  }

  isValidAmount(value) {
    let isValidNumber = this.isValidNumber(value);
    isValidNumber ? this.setState({ amountError: null }) : this.setState({
      amountError: (
        <small className="text-danger">
          Please enter a positive number.
        </small>)
      });
    return isValidNumber;
  }

  isValidCurrency(value) {
    let isInvalid = value == null;
    isInvalid ? this.setState({
      currencyError: (
        <small className="text-danger">
          Please select currency.
        </small>)
    })
      : this.setState({ currencyError: null });
    return !isInvalid;
  }

  isValidDate(value) {
    let isInvalid = value == null;
    isInvalid ? this.setState({
      dateError: (
        <small className="text-danger">
          Please select date.
        </small>)
    })
      : this.setState({ dateError: null });
    return !isInvalid;
  }

  // TODO: on first load resModel empty, it's a bug, deposit currencies select is empty

  getDepositCurrencies() {
    const currencies = [];
    for (let c of this.props.resModel.dailyTickers.keys()) {
      currencies.push({ value: c, label: c.code + " - " + c.name });
    }

    return currencies;
  }

  getWithdrawalCurrencies() {
    let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
    let currencies = [];
    for (const c of currentPortfolio.balances.keys()) {
      currencies.push({ value: c, label: c.code + " - " + c.name });
    }

    return currencies;
  }

  getTypes() {
    return [{ value: true, label: "Deposit" }, { value: false, label: "Withdrawal" }];
  }

  updateCurrencySelection(type) {
    this.setState({
      currencies: type.value ? this.getDepositCurrencies() : this.getWithdrawalCurrencies(),
      currency: null
    })
  }

  isValidNumber(strValue) {
    let numValue = parseFloat(strValue);
    return !isNaN(numValue) && numValue >=0;
  }

  render() {
    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={6}>
              <Modal
                show={this.props.isDialogShown}
                onHide={() => this.props.hideDialog()}
              >
                <Modal.Header closeButton>
                  <Modal.Title>{this.state.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form horizontal>


                    <FormGroup controlId="formHorizontalNumber">
                      <Col componentClass={ControlLabel} sm={4} smOffset={0}>
                        Type
                      </Col>
                      <Col sm={6}>
                        <Select
                          placeholder="Select deposit or withdrawal"
                          name="type"
                          value={this.state.type}
                          options={this.getTypes()}
                          onChange={value => {
                            this.setState({ type: value });
                            this.isValidType(value);
                            if (value !== null) {
                              this.updateCurrencySelection(value);
                            }
                          }}
                        />
                        {this.state.typeError}
                      </Col>
                    </FormGroup>


                    <FormGroup controlId="formHorizontalNumber">
                      <Col componentClass={ControlLabel} sm={4} smOffset={0}>
                        Amount
                      </Col>
                      <Col sm={6}>
                        <FormControl
                          type="number"
                          name="amount"
                          min={0}
                          value={this.state.amount}
                          onChange={event => {
                            this.setState({
                              amount: event.target.value
                            });
                            this.isValidAmount(event.target.value);
                          }}
                        />
                        {this.state.amountError}
                      </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalNumber">
                      <Col componentClass={ControlLabel} sm={4} smOffset={0}>
                        Currency
                      </Col>
                      <Col sm={6}>
                        <Select
                          placeholder="Type or select currency"
                          name="currency"
                          value={this.state.currency}
                          options={this.state.currencies}
                          onChange={value => {
                            this.setState({ currency: value });
                            this.isValidCurrency(value);
                          }}
                        />
                        {this.state.currencyError}
                      </Col>
                    </FormGroup>


                    <FormGroup controlId="formHorizontalNumber">
                      <Col componentClass={ControlLabel} sm={4} smOffset={0}>
                        Date
                      </Col>
                      <Col sm={6}>
                        <Datetime
                          timeFormat={false}
                          inputProps={{ placeholder: "Click to select a date" }}
                          value={this.state.date}
                          onChange={event => {
                            this.setState({ date: (typeof event === "string") ? null : event.toDate() });
                            this.isValidDate((typeof event === "string") ? null : event.toDate());
                          }}
                        />
                        {this.state.dateError}
                      </Col>
                    </FormGroup>


                    <FormGroup controlId="formHorizontalURL">
                      <Col componentClass={ControlLabel} sm={2} smOffset={2}>
                        Comment
                      </Col>
                      <Col sm={6}>
                        <FormControl
                          type="text"
                          name="comment"
                          value={this.state.comment}
                          onChange={event => {
                            this.setState({ comment: event.target.value });
                          }}
                        />
                      </Col>
                    </FormGroup>


                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    simple
                    onClick={() => this.props.hideDialog()}
                  >
                    Cancel
                  </Button>
                  <Button
                    bsStyle="default"
                    fill
                    wd
                    type="submit"
                    onClick={/*() => */this.handleSaveButtonClick.bind(this)}
                  >
                    Save
                  </Button>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default CommonFundingDialog;
