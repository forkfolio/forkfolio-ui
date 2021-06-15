import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Col, Row, Tooltip, OverlayTrigger, FormControl } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
import { clone } from '../../../web3/common.js';

class UniswapV3Card extends Component {
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

  onChangeMinPrice(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.minPrice = Number(newValue);
    subpos.service.minPrice = Number(newValue);
    this.props.updateSubposition(this.props.index, subpos);
  }

  onChangeMaxPrice(newValue) {
    let subpos = clone(this.props.subposition);
    subpos.maxPrice = Number(newValue);
    subpos.service.maxPrice = Number(newValue);
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
          UniswapV3
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
              Min price:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"MinPrice"}
                type="number"
                min={0}
                value={this.props.subposition.minPrice}
                onChange={(event) => this.onChangeMinPrice(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Max price:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"MaxPrice"}
                type="number"
                min={0}
                value={this.props.subposition.maxPrice}
                onChange={(event) => this.onChangeMaxPrice(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              Fee [%]:
            </Col>
            <Col md={6}>
              <FormControl
                placeholder={"Fee"}
                type="number"
                min={0}
                value={this.props.subposition.feeInPercent}
                onChange={(event) => this.onChangeFeeInPercent(event.target.value)}
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
                value={20}
                onChange={event => {
                  this.setState({
                    customMin: Number(event.target.value)
                  });
                }}
              />
            </Col>
          </Row>
          </div>
        }
      />          
    );
  }
}

export default UniswapV3Card;
