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

class CommonTradeDialog extends Component {

  isValidBuyAmount(value) {
    let isValidNumber = this.isValidNumber(value);
    isValidNumber ? this.setState({ buyAmountError: null }) : this.setState({
      buyAmountError: (
        <small className="text-danger">
          Please enter a positive number.
        </small>)
      });
    return isValidNumber;
  }

  isValidBuyCurrency(value) {
    let isInvalid = value == null;
    isInvalid ? this.setState({
      buyCurrencyError: (
        <small className="text-danger">
          Please select buy currency.
        </small>)
      })
    : this.setState({ buyCurrencyError: null });
    return !isInvalid;
  }

  isValidSellAmount(value) {
    let isValidNumber = this.isValidNumber(value);
    isValidNumber ? this.setState({ sellAmountError: null }) : this.setState({
      sellAmountError: (
        <small className="text-danger">
          Please enter a positive number.
        </small>)
      });

    return isValidNumber;
  }

  isValidSellCurrency(value) {
    let isInvalid = value == null;
    isInvalid ? this.setState({
      sellCurrencyError: (
        <small className="text-danger">
          Please select sell currency.
        </small>)
      })
    : this.setState({ sellCurrencyError: null });
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

  getBuyCurrencies(nextProps) {
    let buyCurrencies = [];
    for(let c of nextProps.resModel.dailyTickers.keys()) {
      buyCurrencies.push({ value: c, label: c.code + " - " + c.name });
    }

    return buyCurrencies;
  }

  getSellCurrencies(nextProps) {
    let currentPortfolio = nextProps.userModel.portfolios.slice(-1)[0];
    let sellCurrencies = [];
    for (const c of currentPortfolio.balances.keys()) {
      sellCurrencies.push({ value: c, label: c.code + " - " + c.name });
    }

    return sellCurrencies;
  }

  isValidNumber(strValue) {
    let numValue = parseFloat(strValue);
    return !isNaN(numValue) && numValue >=0;
  }

  /*isAllowedAmount(strValue, sellCurrency) {
    let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
    let numValue = parseFloat(strValue);
    //console.log(sellCurrency.value)
    if(sellCurrency != null) {
      console.log(sellCurrency.value)
      console.log(currentPortfolio.balances.get(sellCurrency.value));
    }
    let isAllowed = sellCurrency != null ? numValue <= currentPortfolio.balances.get(sellCurrency.value) : true;
    return isAllowed;
  }

  getMaxSellValueAndCurrency(sellCurrency) {
    if(sellCurrency != null) {
      let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
      return currentPortfolio.balances.get(sellCurrency.value) + " " + sellCurrency.value.code;
    }

    return "";
  }*/

  isEnabledDate(current) {
    return current.isBefore(Datetime.moment());
  };

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
                        Buy amount
                      </Col>
                      <Col sm={6}>
                        <FormControl
                          type="number"
                          min={0}
                          name="buyAmount"
                          value={this.state.buyAmount}
                          onChange={event => {
                            this.setState({
                              buyAmount: event.target.value
                            });
                            this.isValidBuyAmount(event.target.value);
                          }}
                        />
                        {this.state.buyAmountError}
                      </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalNumber">
                      <Col componentClass={ControlLabel} sm={4} smOffset={0}>
                        Buy currency
                      </Col>
                      <Col sm={6}>
                        <Select
                          placeholder="Type or select currency"
                          name="buyCurrency"
                          value={this.state.buyCurrency}
                          options={this.state.buyCurrencies}
                          onChange={value => {
                            this.setState({ buyCurrency: value });
                            this.isValidBuyCurrency(value);
                          }}
                        />
                        {this.state.buyCurrencyError}
                      </Col>
                    </FormGroup>


                    <FormGroup controlId="formHorizontalNumber">
                      <Col componentClass={ControlLabel} sm={4} smOffset={0}>
                        Sell amount
                      </Col>
                      <Col sm={6}>
                        <FormControl
                          type="number"
                          name="sellAmount"
                          min={0}
                          value={this.state.sellAmount}
                          onChange={event => {
                            this.setState({
                              sellAmount: event.target.value
                            });
                            this.isValidSellAmount(event.target.value);
                          }}
                        />
                        {this.state.sellAmountError}
                      </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalNumber">
                      <Col componentClass={ControlLabel} sm={4} smOffset={0}>
                        Sell currency
                      </Col>
                      <Col sm={6}>
                        <Select
                          placeholder="Type or select currency"
                          name="sellCurrency"
                          value={this.state.sellCurrency}
                          options={this.state.sellCurrencies}
                          onChange={value => {
                            this.setState({ sellCurrency: value });
                            this.isValidSellCurrency(value);
                          }}
                        />
                        {this.state.sellCurrencyError}
                      </Col>
                    </FormGroup>


                    <FormGroup controlId="formHorizontalNumber">
                      <Col componentClass={ControlLabel} sm={4} smOffset={0}>
                        Date
                      </Col>
                      <Col sm={6}>
                        <Datetime
                          isValidDate={this.isEnabledDate}
                          timeFormat={false}
                          inputProps={{ placeholder: "Click to select a date" }}
                          value={this.state.date}
                          onChange={event => {
                            this.setState({ date: (typeof event === "string") ? null : event.toDate()});
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

export default CommonTradeDialog;
