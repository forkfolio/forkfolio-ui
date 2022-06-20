import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { 
  Col, 
  Row
} from "react-bootstrap";
import Select from "react-select";
import "react-select/dist/react-select.css";
import Button from "components/CustomButton/CustomButton.jsx";

class AddSubpositionCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedType: { value: 'uniswap', label: 'uniswap' }
    }
  }

  getTypes() {
    return this.props.types.map((type, index) => {
      return { value: type, label: type };
    });
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
              <Select
                placeholder="Type"
                name="type"
                value={this.state.selectedType}
                options={this.getTypes()}
                onChange={value => {
                  this.setState({ selectedType: value });
                }}
              />
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Button
                  bsStyle="info"
                  fill
                  //special   
                  onClick={() => this.props.addSubposition(this.state.selectedType.value)}
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
