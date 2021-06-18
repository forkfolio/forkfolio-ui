import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Col, Row, Tooltip, OverlayTrigger, FormControl } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
import { clone } from '../../../web3/common.js';

class DYDXShortCard extends Component {
  constructor(props) {
    super(props);
  }

  onChangeQuantity(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.quantity = Number(newValue);
    subpos.service.quantity = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeStartBase(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.base.start = Number(newValue);
    subpos.service.collateralBASE = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeBorrowedUnder(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.borrowedUNDER = Number(newValue);
    subpos.service.borrowedUNDER = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeBoughtBase(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.boughtBASE = Number(newValue);
    subpos.service.boughtBASE = Number(newValue);
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
          dYdX Short
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
              Start BASE:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                disabled
                min={0}
                value={this.props.subposition.base.start}
                onChange={(event) => this.onChangeStartBase(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Borrowed UNDER:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                disabled
                min={0}
                value={this.props.subposition.borrowedUNDER}
                onChange={(event) => this.onChangeBorrowedUnder(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Bought BASE:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                disabled
                min={0}
                value={this.props.subposition.boughtBASE}
                onChange={(event) => this.onChangeBoughtBase(event.target.value)}
              />
            </Col>
          </Row>
          </div>
        }
      />          
    );
  }
}

export default DYDXShortCard;
