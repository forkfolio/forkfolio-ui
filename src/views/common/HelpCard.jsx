import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Grid, Row, Col } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";

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
                <Col lg={5} md={3} sm={0} xs={0}>
                  <p>Welcome to Forkfolio app, a private-by-design crypto portfolio manager you 
                    can use to watch live crypto prices, track your trades, and get insights 
                    into your trading performance. </p>
                  <p>If you haven't seen Forkfolio in action, visit <a href="https://forkfol.io/demo/">demo app</a> loaded with public portfolio 
                    that showcases all features, or click on a play button to watch a short 
                    introductory video.</p>
                  <h4 class="help-card-title">Quick start</h4> 
                  <p class="help-card-paragraph">Your portfolio is like a bank account - first, you need to deposit tokens to 
                    your portfolio to be able to trade them for another one. </p>
                  <Button
                    danger
                    bsStyle="danger"
                    fill
                    wd                    
                    onClick={() => this.props.showAddFundingDialog()}
                  >
                    Add Your First Deposit Now
                  </Button>
                </Col>
                <Col lg={7} md={9} sm={12} xs={12} >
                  <iframe title="Getting started with ForkFolio" width="600" height="370" src="https://www.useloom.com/embed/87407d8535bd43b7b5c8a67da8c99d77" frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen></iframe>
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
