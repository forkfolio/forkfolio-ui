import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Col, Row, Tooltip, OverlayTrigger, FormControl } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
import { clone } from '../../../web3/common.js';

class DYDXLongCard extends Component {

  onChangeQuantity(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.quantity = Number(newValue);
    subpos.service.quantity = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeStartUnder(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.under.start = Number(newValue);
    subpos.service.collateralUNDER = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeBorrowedBase(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.borrowedBASE = Number(newValue);
    subpos.service.borrowedBASE = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeBoughtUnder(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.boughtUNDER = Number(newValue);
    subpos.service.boughtUNDER = Number(newValue);
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
          dYdX Long
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
              Quantity:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Quantity"}
                type="number"
                min={0}
                value={this.props.subposition.quantity}
                onChange={(event) => this.onChangeQuantity(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Start UNDER:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                disabled
                min={0}
                value={this.props.subposition.under.start}
                onChange={(event) => this.onChangeStartUnder(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Borrowed BASE:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                disabled
                min={0}
                value={this.props.subposition.borrowedBASE}
                onChange={(event) => this.onChangeBorrowedBase(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Bought UNDER:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                disabled
                min={0}
                value={this.props.subposition.boughtUNDER}
                onChange={(event) => this.onChangeBoughtUnder(event.target.value)}
              />
            </Col>
          </Row>
          </div>
        }
      />          
    );
  }
}

export default DYDXLongCard;
