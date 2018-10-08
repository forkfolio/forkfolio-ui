import React, { Component } from "react";
import { Grid, Row, Col, Modal} from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";

class ConfirmNewPortfolioDialog extends Component {

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
                  <Modal.Title>Confirm new portfolio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>
                  You have unsaved changes in your current portfolio. If you create a
		              new portfolio, unsaved changes will be lost.
                  </p>
                  <br />
                  <p>
                    Are you sure you want to create a new portfolio?
                  </p>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    simple
                    onClick={() => this.props.createNew()}
                  >
                    Yes
                  </Button>
                  <Button
                    simple
                    onClick={() => this.props.hideDialog()}
                  >
                    No
                  </Button>
                  <Button
                    bsStyle="default"
                    fill
                    wd
                    type="submit"
                    onClick={() => this.props.saveCurrentAndCreateNew()}
                  >
                    Save Current and Create New
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

export default ConfirmNewPortfolioDialog;
