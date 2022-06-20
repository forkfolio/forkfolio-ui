import React, { Component } from "react";
// react component for creating dynamic tables
import ReactTable from "react-table";
import { Grid, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";

import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import AddFundingDialog from "./dialogs/AddFundingDialog";
import EditFundingDialog from "./dialogs/EditFundingDialog";
import ConfirmRemoveTransactionDialog from "./dialogs/ConfirmRemoveTransactionDialog";
import { formatUtils } from './../utils/FormatUtils';
import ReactGA from 'react-ga';

class FundingView extends Component {
  constructor(props) {
    super(props);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
    this.removeTransaction = this.removeTransaction.bind(this);
    this.state = {
      data: this.mapTradesToState(props),
      isConfirmDialogShown: false,
      removedTransaction: null
    };
  }

  componentWillMount() {
    console.log("Navigate to: " + window.location.pathname + window.location.hash);
    ReactGA.pageview(window.location.pathname + window.location.hash);
  }
  
  // safely change state here
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: this.mapTradesToState(nextProps)
    });
  }

  mapTradesToState(props) {
    // first get data from user and res model
    const tableData = [];
    let newestFirst = props.userModel.transactions.slice(0, props.userModel.transactions.length);
    newestFirst.sort((a, b) => b.time.getTime() - a.time.getTime());
    for (let tx of newestFirst) {
      if(!tx.isTrade) {
        let date = tx.time.toISOString().split('T')[0];
        let name = tx.pair.base.name;
        let type = tx.isBuy ? "Deposit" : "Withdrawal";
        let comment = tx.comment === "null" ? "" : tx.comment;
        let volume = [tx.baseAmount, tx.pair.base.code];
        tableData.push([tx, date, name, type, comment, volume]);
      }
    }

    return tableData.map((prop, key) => {
      return {
        id: prop[0],
        date: prop[1],
        name: prop[2],
        type: prop[3],
        comment: prop[4],
        volume: prop[5],
        actions: (
          // we've added some custom button actions
          <div className="actions-right">
            <Button
              onClick={() => {
                this.props.setEditedTransaction(this.state.data[key].id);
                this.props.showEditFundingDialog();
                return true;
              }}
              bsStyle="default"
              table
              simple
              icon
            >
              <i className="fa fa-edit" />
            </Button>{" "}
            <Button
              onClick={() => {
                this.setState({
                  isConfirmDialogShown: true,
                  removedTransaction: this.state.data[key].id
                });
                return true;
              }}
              bsStyle="danger"
              table
              simple
              icon
            >
              <i className="fa fa-times" />
            </Button>{" "}
          </div>
        )
      };
    })
  }

  getTableColumns() {
    const tableColumns = [
      { Header: "Date", accessor: "date", minWidth: 95, width: 160,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Name", accessor: "name", minWidth: 120, width: 200,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Type", accessor: "type", minWidth: 95, width: 120,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Comment", accessor: "comment", minWidth: 100, width: 300, maxWidth: 500,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Volume", accessor: "volume", minWidth: 120, width: 150, filterable: false,
      Cell: row => (
        <span style={{ float: "right" }}>
          {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
        </span>
      ),
      sortMethod: (a, b) => {
        return b[0] - a[0];
      }
    },
      { Header: "Actions", accessor: "actions", minWidth: 80, maxWidth: 80, sortable: false, filterable: false }
    ];

    return tableColumns;
  }

  hideConfirmDialog() {
    this.setState({
      isConfirmDialogShown: false
    });
  }

  removeTransaction() {
    this.props.removeTransaction(this.state.removedTransaction);
    this.hideConfirmDialog();
  }

  getNoDataText(name, userModel) {
    let currentPortfolio = userModel.portfolios.slice(-1)[0];
    if(currentPortfolio.tradeCount === 0) {
      // if there are no trades, and no fundings
      if(userModel.transactions.length === 0) {
        return (<span><p>Your portfolio is empty. To get started:</p>
          <ol>
            <li>click on the Add Funding button,</li>
            <li>add your first deposit.</li>
         </ol>
         </span>);
      } 

      return (<span>No {name} found</span>)
    }
  }

  render() {
    let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
    let fundingCount = this.props.userModel.transactions.length - currentPortfolio.tradeCount;

    let addFundingDialog = (
      <AddFundingDialog
        isDialogShown={this.props.isAddFundingDialogShown}
        hideDialog={this.props.hideAddFundingDialog}
        addTransaction={this.props.addTransaction}
        userModel={this.props.userModel}
        resModel={this.props.resModel}
      />
    );

    let editFundingDialog = (
      <EditFundingDialog
        isDialogShown={this.props.isEditFundingDialogShown}
        hideDialog={this.props.hideEditFundingDialog}
        editedTransaction={this.props.editedTransaction}
        updateTransaction={this.props.updateTransaction}
        userModel={this.props.userModel}
        resModel={this.props.resModel}
      />
    );
    
    let confirmRemoveTransactionDialog = (
      <ConfirmRemoveTransactionDialog
        isDialogShown={this.state.isConfirmDialogShown}
        hideDialog={this.hideConfirmDialog}
        removedTransaction={this.state.removedTransaction}
        removeTransaction={this.removeTransaction}
      />
    );

    const tooltipHelpText1 = <Tooltip id="edit_tooltip">
      Funding panel displays all your portfolio fundings: deposits and withdrawals. Deposit is when you add currency to your portfolio, and withdrawal is when you remove it. <br/><br/> 
      To add a funding, click on the Add funding button. To edit or remove a funding, click on the edit/remove icon found in ACTIONS column.<br/><br/> 
      Fundings can be sorted, and filtered in multiple ways. For example, to show all USD withdrawals in 2018, enter United States Dollar in the NAME filter, and 2018 in the DATE filter.
    </Tooltip>; 

    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="What are my recent deposits and withdrawals?"
                rightSection={
                  <div>
                  <Button
                    // was like this for without color
                    //special
                    //simple
                    bsStyle="info"
                    fill
                    special                   
                    onClick={() => this.props.showAddFundingDialog()}
                  >
                    <i className={"fa fa-plus"} /> Add funding
                  </Button>
                  <OverlayTrigger placement="bottom" overlay={tooltipHelpText1}>
                    <Button
                      bsStyle="default"
                      special // for share button: fa fa-share-alt
                      //speciallarge 
                      //pullRight
                      simple
                    >
                      <i className={"fa fa-question-circle"} /> Help 
                    </Button> 
                  </OverlayTrigger>
                  </div>
                }
                category={fundingCount + " funding" + (fundingCount === 1 ? "" : "s")}
                content={
                  <ReactTable
                    className="-highlight"
                    data={this.state.data}
                    filterable
                    columns={this.getTableColumns()}
                    defaultPageSize={10}                    
                    noDataText={this.getNoDataText('deposits or withdrawals', this.props.userModel)} 
                  />
                }
              />
              {this.props.isAddFundingDialogShown ? addFundingDialog : ""}
              {this.props.isEditFundingDialogShown ? editFundingDialog : ""}
              {this.state.isConfirmDialogShown ? confirmRemoveTransactionDialog : ""}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default FundingView;
