import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Col, Row, Tooltip, OverlayTrigger, FormControl } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
import { clone } from '../../../web3/common.js';

class GammaOptionsCard extends Component {

  //onChangeStartBase(newValue) {
  //  let subpos = clone(this.props.subposition);
  //  subpos.base.start = Number(newValue);
  //  this.props.updateSubposition(this.props.index, subpos);
  //}
  onChangeIsLong(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.isLong = newValue === 'B';
    subpos.service.isLong = newValue === 'B';
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeIsCall(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.isCall = newValue === 'C';
    subpos.service.isCall = newValue === 'C';
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeQuantity(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.quantity = Number(newValue);
    subpos.service.quantity = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeStrike(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.strike = Number(newValue);
    subpos.service.strike = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeDaysToExpiry(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.daysToExpiry = Number(newValue);
    subpos.service.daysToExpiry = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeIV(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.iv = Number(newValue);
    subpos.service.iv = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeEnabled(checked) {
    let subpos = clone(this.props.subposition);
    subpos.enabled = checked;
    this.props.updateSubposition(this.props.index, subpos);
  }

  getTitle() {
    return (
      <Row>
        <Col md={4}>
          <FormControl
            type="checkbox"
            checked={this.props.subposition.enabled}
            onChange={(event) => this.onChangeEnabled(event.target.checked)}
          />
        </Col>
        <Col md={6}>
          Gamma Options
        </Col>
      </Row>
    );
  }

  render() {
    const tooltipHelpText = <Tooltip id="edit_tooltip">
      Close this subposition
    </Tooltip>; 
    return (
      <Card
        title={this.getTitle()}
        rightSection={
          <OverlayTrigger placement="bottom" overlay={tooltipHelpText}>
            <Button
              bsStyle="default"
              special
              simple
              onClick={() => this.props.removeSubposition(this.props.index)}
            >
              <i className={"fa fa-times"} />
            </Button> 
          </OverlayTrigger>
        }
        content={
          <div>
          <Row>
            <Col md={6}>
              Buy or Sell:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"BuyOrSell"}
                type="text"
                value={this.props.subposition.isLong ? 'B' : 'S'}
                onChange={(event) => this.onChangeIsLong(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Call or Put:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="text"
                value={this.props.subposition.isCall ? 'C' : 'P'}
                onChange={(event) => this.onChangeIsCall(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Quantity:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.quantity}
                onChange={(event) => this.onChangeQuantity(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Strike:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.strike}
                onChange={(event) => this.onChangeStrike(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Days to expiry:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.daysToExpiry}
                onChange={(event) => this.onChangeDaysToExpiry(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              IV [%]:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.iv}
                onChange={(event) => this.onChangeIV(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Start BASE:
            </Col>
            <Col md={6}>
              <FormControl
                disabled
                placeholder={"Amount"}
                type="number"
                value={this.props.subposition.base.start.toFixed(2)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Start UNDER:
            </Col>
            <Col md={6}>
              <FormControl
                disabled
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.under.start.toFixed(2)}
              />
            </Col>
          </Row>
          </div>
        }
      />          
    );
  }
}

export default GammaOptionsCard;
