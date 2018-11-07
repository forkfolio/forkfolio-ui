import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Grid, Row, Col } from "react-bootstrap";

class DemoCard extends Component {
   render() {
    return (
      <div>
        <Card
          content={
            <Grid fluid>
              <Row>
                <Col lg={12} md={12}>
                  <p><i class="fa fa-exclamation-triangle font-orange" aria-hidden="true"></i> You're seeing a live demo, showcasing features on a sample portfolio. <a href="https://forkfol.io/app/">Click here to create your portfolio now <i class="fa fa-check" aria-hidden="true"></i></a></p>            
                </Col>
              </Row>
            </Grid>
          }
        />
      </div>
    );
  }
}

export default DemoCard;
