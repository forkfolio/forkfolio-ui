import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Col, Row } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";

class AddSubpositionCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card
        title={'Add New'}
        content={
          <div>
            <Row>
              <Col md={12}>
                <div className="table-responsive">
                  <h5>Select subposition</h5>

                </div>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Button
                  bsStyle="info"
                  fill
                  //special   
                  onClick={() => this.props.addSubposition()}
                >
                  <i className={"fa fa-plus"} /> Add subposition
                </Button> 
              </Col>
            </Row>
          </div>
        }
      />          
    );
  }
}

export default AddSubpositionCard;
