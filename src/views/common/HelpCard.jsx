import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Grid, Row, Col } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
//import { resModel } from "../../model/init/ResModelInit.js";

// TODO remove resModel, use props

class HelpCard extends Component {
   render() {
    return (
      <div>
      {this.props.isHelpPanelShown ? (
        <Card
          title="Getting started"
          content={
            <Grid fluid>
              <Row>
                <Col md={6}>
                  <iframe title="Getting started with ForkFolio" width="630" height="394" src="https://www.useloom.com/embed/f4f07be58c954532b3d3d9e62cde3dfd" frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen></iframe>
                </Col>

                <Col md={3}>
                  <p>Your portfolio is similar to a bank account - you need to deposit some funds to be able to trade one asset for another. Go to Funding -> Add Funding to deposit crypto or fiat currencies to portfolio.</p>
                  <p>If you don't know what your past trades are, you can use deposits to add final balance of your assets, and track your portfolio from that moment on.</p>
                  <p>If you have your past trades, you can go to Trades -> Add Trades to add your past trades. Now you can analyze how much are your trades profitable, and get insight into your trading strategy.</p>
                </Col>
                <Col md={3}>
                  
                  <p><i className={"fa fa-exclamation-triangle"} /> Important: don't forget to save your changes as <b><u>we don't have access</u></b> to any of your data. Go to Manage -> Save to save all changes you've made.  </p>
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
