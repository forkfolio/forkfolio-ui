import React, { Component } from "react";
// react component for creating dynamic tables
import ReactTable from "react-table";

import { Grid, Row, Col, } from "react-bootstrap";

import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import AddTradeDialog from "./dialogs/AddTradeDialog";
import EditTradeDialog from "./dialogs/EditTradeDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import { formatUtils } from './../utils/FormatUtils';

class TradesView extends Component {
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
      if (tx.isTrade) {
        let date = tx.time.toISOString().split('T')[0];
        let pair = tx.pair.base.code + "/" + tx.pair.counter.code;
        let type = tx.isBuy ? "Buy" : "Sell";
        let comment = tx.comment === "null" ? "" : tx.comment;
        let volume = [tx.baseAmount, tx.pair.base.code];
        let price = [tx.getPrice(), tx.pair.counter.code];
        let cost = [tx.counterAmount, tx.pair.counter.code];
        let profitPercent = tx.getProfitPercent(props.resModel);
        let profit = [tx.getProfit(props.resModel, props.resModel.usd), props.resModel.usd.code];
        tableData.push([tx, date, pair, type, comment, volume, price, cost, profitPercent, profit]);
      }
    }

    // second, map to state
    return tableData.map((prop, key) => {
      return {
        id: prop[0],
        date: prop[1],
        pair: prop[2],
        type: prop[3],
        comment: prop[4],
        volume: prop[5],
        price: prop[6],
        cost: prop[7],
        profitpercentage: prop[8],
        profit: prop[9],
        actions: (
          <div className="actions-right">
            <Button
              onClick={() => {
                this.props.setEditedTransaction(this.state.data[key].id);
                this.props.showEditTradeDialog();
                return true;
              }}
              bsStyle="default"
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

  getTotalProfit(rows) {
    let total = 0;
    for (let row of rows.data) {
      total += row.profit[0];
    }
    return total;
  }

  getTableColumns() {
    const tableColumns = [
      { Header: "Date", accessor: "date", minWidth: 95, maxWidth: 100,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Pair", accessor: "pair", maxWidth: 100,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Type", accessor: "type", maxWidth: 50,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Comment", accessor: "comment", maxWidth: 300,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Volume", accessor: "volume", maxWidth: 120, filterable: false,
        Cell: row => (
          <span style={{ float: "right" }}>
            {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
          </span>
        ),
        sortMethod: (a, b) => { return b[0] - a[0]; }
      },
      { Header: "Price", accessor: "price", maxWidth: 160, filterable: false,
      Cell: row => (
        <span style={{ float: "right" }}>
          {formatUtils.formatNumber(row.value[0], 6) + " " + row.value[1]}
        </span>
      ),
      sortMethod: (a, b) => {
        return b[0] - a[0];
      }},
      { Header: "Cost", accessor: "cost", maxWidth: 120, filterable: false,
      Cell: row => (
        <span style={{ float: "right" }}>
          {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
        </span>
      ),
      sortMethod: (a, b) => {
        return b[0] - a[0];
      }},
      { Header: "Profit [%]", accessor: "profitpercentage", maxWidth: 80, filterable: false,
      Cell: row => (
        <span style={{ float: "right" }}>
          {formatUtils.formatNumber(row.value, 2) + "%"}
        </span>
      ),
      sortMethod: (a, b) => {
        return b - a;
      }},
      { Header: "Profit", accessor: "profit", maxWidth: 160, filterable: false,
      Cell: row => (
        <span style={{ float: "right" }}>
          {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
        </span>
      ),
      sortMethod: (a, b) => {
        return b[0] - a[0];
      }, Footer: rows => (
          <span style={{ float: "right" }}>
            <strong>
              {formatUtils.formatNumber(this.getTotalProfit(rows), 2) + " USD"}
            </strong>
          </span>
        )
      },
      { Header: "Actions", accessor: "actions", minWidth: 70, maxWidth: 70, sortable: false, filterable: false }
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

  render() {
    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="What are my recent trades?"
                content={
                  <ReactTable
                    data={this.state.data}
                    filterable
                    columns={this.getTableColumns()}
                    defaultPageSize={10}
                    className="-striped -highlight"
                  />
                }
              />
            </Col>
          </Row>
          <Row>
            <Col md={2} mdOffset={10}>
              <Button
                bsStyle="default"
                fill
                wd
                onClick={() => this.props.showAddTradeDialog()}
              >
                Add Trade
              </Button>
              <AddTradeDialog
                isDialogShown={this.props.isAddTradeDialogShown}
                hideDialog={this.props.hideAddTradeDialog}
                addTransaction={this.props.addTransaction}
                userModel={this.props.userModel}
                resModel={this.props.resModel}
              />
              <EditTradeDialog
                isDialogShown={this.props.isEditTradeDialogShown}
                hideDialog={this.props.hideEditTradeDialog}
                editedTransaction={this.props.editedTransaction}
                updateTransaction={this.props.updateTransaction}
                userModel={this.props.userModel}
                resModel={this.props.resModel}
              />
              <ConfirmDialog
                isDialogShown={this.state.isConfirmDialogShown}
                hideDialog={this.hideConfirmDialog}
                removedTransaction={this.state.removedTransaction}
                removeTransaction={this.removeTransaction}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default TradesView;
