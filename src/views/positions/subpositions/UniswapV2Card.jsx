import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Col, Row, Tooltip, OverlayTrigger, FormControl } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
import { clone } from '../../../web3/common.js';

class UniswapV2Card extends Component {
  constructor(props) {
    super(props);
  }

  onChangeStartBase(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.base.start = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeExtraBase(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.base.extra = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeStartUnder(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.under.start = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeExtraUnder(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.under.extra = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeStartLiq(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.liq.start = Number(newValue);
    subpos.service.myLIQ = Number(newValue) + subpos.liq.extra;
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeExtraLiq(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.liq.extra = Number(newValue);
    subpos.service.myLIQ = subpos.liq.start + Number(newValue);
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
          UniswapV2
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
              Start BASE:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.base.start}
                onChange={(event) => this.onChangeStartBase(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Extra BASE:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.base.extra}
                onChange={(event) => this.onChangeExtraBase(event.target.value)}
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
                min={0}
                value={this.props.subposition.under.start}
                onChange={(event) => this.onChangeStartUnder(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Extra UNDER:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.under.extra}
                onChange={(event) => this.onChangeExtraUnder(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Start LIQ:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.liq.start}
                onChange={(event) => this.onChangeStartLiq(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Extra LIQ:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Amount"}
                type="number"
                min={0}
                value={this.props.subposition.liq.extra}
                onChange={(event) => this.onChangeExtraLiq(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              APR [%]:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"%"}
                type="number"
                min={0}
                value={this.props.subposition.apr}
                onChange={(event) => this.onChangeAPR(event.target.value)}
              />
            </Col>
          </Row>
          </div>
        }
      />          
    );
  }
}

export default UniswapV2Card;
