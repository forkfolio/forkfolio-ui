import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Col, Row, Tooltip, OverlayTrigger, FormControl } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
import { clone } from '../../../web3/common.js';

class SqueethCard extends Component {

  onChangeIsLong(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.isLong = newValue === 'L';
    subpos.service.isLong = newValue === 'L';
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeQuantity(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.quantity = Number(newValue);
    subpos.service.quantity = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeAPR(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.apr = Number(newValue);
    subpos.service.apr = Number(newValue);
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
          Squeeth
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
              Long or Short:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Long or Short"}
                type="text"
                value={this.props.subposition.isLong ? 'L' : 'S'}
                onChange={(event) => this.onChangeIsLong(event.target.value)}
              />
            </Col>
          </Row>
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
              APR [%]:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"APR %"}
                type="number"
                min={0}
                value={this.props.subposition.apr}
                onChange={(event) => this.onChangeAPR(event.target.value)}
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
                placeholder={"Start BASE"}
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
                placeholder={"Start UNDER"}
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

export default SqueethCard;
