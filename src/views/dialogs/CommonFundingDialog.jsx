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
  ControlLabel,
  Tab,
  Tabs
} from "react-bootstrap";

import Button from "components/CustomButton/CustomButton.jsx";

class CommonFundingDialog extends Component {

  constructor(props) {
    super(props);
    this.handleTabSelect = this.handleTabSelect.bind(this);
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

  getDepositCurrencies() {
    const currencies = [];
    for (let c of this.props.resModel.dailyTickers.keys()) {
      currencies.push({ value: c, label: c.code });
    }

    return currencies;
  }

  getWithdrawalCurrencies() {
    let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
    let currencies = [];
    for (const c of currentPortfolio.balances.keys()) {
      currencies.push({ value: c, label: c.code });
    }

    return currencies;
  }

  isValidNumber(strValue) {
    let numValue = parseFloat(strValue);
    return !isNaN(numValue) && numValue >=0;
  }

  isEnabledDate(current) {
    // between 2009-01-01 and now
    return current.isAfter(new Date(2008, 11, 31)) && current.isBefore(Datetime.moment());
  };

  getBuySellFormGroup(name, placeholder) {
    this.selected = name;
    return (
      <FormGroup controlId="formHorizontalNumber">
      <Col componentClass={ControlLabel} sm={3} smOffset={0}>
        {name}
      </Col>
      <Col sm={5}>
        <FormControl
          placeholder={placeholder}
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
      <Col sm={3}>
        <Select
          placeholder="Currency"
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
    );
  }

  getDateFormGroup() {
    return (
      <FormGroup controlId="formHorizontalNumber">
      <Col componentClass={ControlLabel} sm={3} smOffset={0}>
        Date
      </Col>
      <Col sm={5}>
        <Datetime
          isValidDate={this.isEnabledDate}
          dateFormat={'YYYY-MM-DD'}
          timeFormat={false}
          closeOnSelect={true}
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
    );
  }

  getCommentFormGroup() {
    return (
      <FormGroup controlId="formHorizontalURL">
      <Col componentClass={ControlLabel} sm={3} smOffset={0}>
        Comment
      </Col>
      <Col sm={5}>
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
    );
  }

  handleTabSelect(key) {
    this.setState({
      isDeposit: key === "deposit",
      currencies: key === "deposit" ? this.getDepositCurrencies() : this.getWithdrawalCurrencies(),
      currency: null
    });
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
                  <Tabs
                    activeKey={this.state.isDeposit ? "deposit" : "withdrawal"}
                    onSelect={this.handleTabSelect}
                    id="controlled-tab-example"
                  >
                    <Tab eventKey="deposit" title="Deposit">
                      <Form horizontal> 
                        {this.getBuySellFormGroup("Deposit", "Deposit amount")}
                        {this.getDateFormGroup()}
                        {this.getCommentFormGroup()}
                      </Form>
                    </Tab>
                    <Tab eventKey="withdrawal" title="Withdrawal">
                      <Form horizontal> 
                        {this.getBuySellFormGroup("Withdrawal", "Withdrawal amount")}
                        {this.getDateFormGroup()}
                        {this.getCommentFormGroup()}
                      </Form>
                    </Tab>
                  </Tabs>
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
                    {this.state.buttonText}
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
