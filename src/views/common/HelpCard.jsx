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
                  <p>Your portfolio is similar to a bank account - you need to deposit an asset to portfolio to be able to trade that asset for another one. </p>
                  <h5>Adding your first deposit</h5> 
                  <ol>
                    <li>navigate to the <a href="#/funding">Funding</a> page,</li>
                    <li>click on the Add Funding button,</li>
                    <li>add your first deposit.</li>
                  </ol>
                  <h5>Adding your first trade</h5> 
                  <ol>
                    <li>navigate to the <a href="#/trades">Trades</a> page,</li>
                    <li>click on the Add Trade button,</li>
                    <li>add your first trade.</li>
                  </ol>                  
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
