import React, { Component } from "react";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Card from "components/Card/Card.jsx";
import { Grid, Row, Col, Alert } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
//import { resModel } from "../../model/init/ResModelInit.js";

// TODO remove resModel, use props

class HelpCard extends Component {
  constructor(props) {
    super(props);
  }
   render() {
    return (
      <div>
      {this.props.isHelpPanelShown ? (
        <Card
          title="Getting started"
          content={
            <Grid fluid>
              <Row>
                <Col md={3}>
                  <p>Your portfolio is similar to bank account - you need to have some funds to be able to trade one asset for another. Go to Funding -> Add Funding to deposit crypto or fiat currencies to portfolio.</p>
                  <p>If you don't know what your past trades are, you can use deposits to add final balance of your assets, and track your portfolio from that moment on.</p>
                </Col>
                <Col md={3}>
                  <p>If you have your past trades, you can go to Trades -> Add Trades to add your past trades. Now you can analyze how much are your trades profitable, and get insight into your trading strategy.</p>
                  <p>Important: don't forget to save your changes as <b>we don't have access</b> to any of your data. Go to Manage -> Save to save your updates.  </p>
                </Col>
                <Col md={6}>
                  <p>Video goes here</p>
                </Col>
              </Row>
              <Row>
              <Col md={2} mdOffset={11}>
                <Button
                  bsStyle="default"
                  fill
                  onClick={() => this.props.hideHelpPanel()}
                >
                  Close
                </Button>
                </Col>
              </Row>
            </Grid>
          }
        /> ) : ("") }
        </div>
    );
  }
}

export default HelpCard;
