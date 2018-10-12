import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  Modal,
} from "react-bootstrap";

import Button from "components/CustomButton/CustomButton.jsx";


class ConfirmRemoveTransactionDialog extends Component {

  getType() {
    if (this.props.removedTransaction != null) {
      return this.props.removedTransaction.isTrade ? "trade" : "funding";
    }
  }

  getDescription() {
    if (this.props.removedTransaction != null) {
      return (this.props.removedTransaction.isTrade ? "Trade" : "Funding") + ": " + this.props.removedTransaction.toShortString();
    }
  }

  getDate() {
    if (this.props.removedTransaction != null) {
      return "Date: " + this.props.removedTransaction.time.toISOString().split('T')[0];
    }
  }

  getComment() {
    if (this.props.removedTransaction != null) {
      return "Comment: " + this.props.removedTransaction.comment;
    }
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
                  <Modal.Title>Confirm remove</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>
                    Are you sure you want to remove this {this.getType()}?
                  </p>
                  <br />
                  <p>
                    {this.getDescription()}
                  </p>
                  <p>
                    {this.getDate()}
                  </p>
                  <p>
                    {this.getComment()}
                  </p>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    simple
                    onClick={() => this.props.hideDialog()}
                  >
                    Cancel
                  </Button>
                  <Button
                    bsStyle="default"
                    fill
                    wd
                    type="submit"
                    onClick={() => this.props.removeTransaction()}
                  >
                    Remove
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

export default ConfirmRemoveTransactionDialog;
