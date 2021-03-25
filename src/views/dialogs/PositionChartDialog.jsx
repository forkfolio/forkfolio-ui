import React, { Component } from "react";
import "react-select/dist/react-select.css";
import { Grid, Row, Col, Modal } from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";
import PositionChartCard from "../positions/PositionChartCard";

class PositionChartDialog extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={6}>
              <Modal
                show={this.props.isDialogShown}
                onHide={() => this.props.hideDialog()}
              >
                <Modal.Header closeButton>
                  <Modal.Title>{this.props.selectedPosition.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <PositionChartCard />
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    simple
                    onClick={() => this.props.hideDialog()}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default PositionChartDialog;
