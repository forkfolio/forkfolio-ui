import React, { Component } from "react";
// react component for creating dynamic tables
import ReactTable from "react-table";
import { Grid, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import AddTradeDialog from "./dialogs/AddTradeDialog";
import EditTradeDialog from "./dialogs/EditTradeDialog";
import ConfirmRemoveTransactionDialog from "./dialogs/ConfirmRemoveTransactionDialog";
import { formatUtils } from './../utils/FormatUtils';
import ReactGA from 'react-ga';

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

  getTotalVolume(rows) {
    let total = 0;
    for (let row of rows.data) {
      total += row.volume[0] * (row.type === "Buy" ? 1 : -1);
    }
    return total;
  }

  getTotalPrice(rows) {
    return this.getTotalCost(rows) / this.getTotalVolume(rows);
  }

  getTotalCost(rows) {
    let total = 0;
    for (let row of rows.data) {
      total += row.cost[0] * (row.type === "Buy" ? 1 : -1);
    }
    return total;
  }

  getTotalProfitPercentage(rows) {
    let pairStr = rows.data[0].pair.split('/');
    let base = this.props.resModel.findCurrencyByCode(pairStr[0]);
    let counter = this.props.resModel.findCurrencyByCode(pairStr[1]);
    if(base !== null && counter !== null) {
      let totalCost = this.getTotalCost(rows);
      let totalCostInUsd = totalCost * this.props.resModel.getLastPrice(counter, this.props.resModel.usd);
      let totalProfit = this.getTotalProfit(rows);
      let isBuy = this.getTypeFooter(rows) === "Buy";
      totalCostInUsd = totalCostInUsd * (isBuy ? 1 : -1);
      // check eth/usd and rep/usd
      return (totalProfit / Math.max(0, totalCostInUsd)) * 100; 
    }

    return 0;
  }

  getTotalProfit(rows) {
    let total = 0;
    for (let row of rows.data) {
      total += row.profit[0];
    }
    return total;
  }

  isOnePair(rows) {
    for(let row of rows.data) {
      if(row.pair !== rows.data[0].pair) {
        return false;
      }
    }
    return rows.data.length !== 0;
  }

  getPairFooter(rows) {
    if(this.isOnePair(rows)) {
      return rows.data[0].pair;
    }

    return "";
  }

  getTypeFooter(rows) {
    if(this.isOnePair(rows)) {
      return this.getTotalVolume(rows) >= 0 ? "Buy" : "Sell";
    }

    return "";
  }

  getVolumeFooter(rows) {
    if(this.isOnePair(rows)) {
      return formatUtils.formatNumber(Math.abs(this.getTotalVolume(rows)), 2) + " " + rows.data[0].volume[1];
    }

    return "";
  }

  getPriceFooter(rows) {
    if(this.isOnePair(rows)) {
      return formatUtils.formatNumber(this.getTotalPrice(rows), 6) + " " + rows.data[0].cost[1];
    }

    return "";
  }

  getCostFooter(rows) {
    if(this.isOnePair(rows)) {
      let isBuy = this.getTypeFooter(rows) === "Buy";
      return formatUtils.formatNumber(this.getTotalCost(rows) * (isBuy ? 1 : -1), 2) + " " + rows.data[0].cost[1];
    }

    return "";
  }

  getProfitPercentageFooter(rows) {
    if(this.isOnePair(rows)) {
      return formatUtils.formatNumber(this.getTotalProfitPercentage(rows), 2) + "%";
    }

    return "";
  }

  getTableColumns() {
    const tableColumns = [
      { Header: "Date", accessor: "date", minWidth: 95, maxWidth: 100,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Pair", accessor: "pair", maxWidth: 100,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
        Footer: rows => (
        <span>
          <strong>
            {this.getPairFooter(rows)}
          </strong>
        </span>
        )
      },
      { Header: "Type", accessor: "type", maxWidth: 50,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
        Footer: rows => (
          <span>
            <strong>
              {this.getTypeFooter(rows)}
            </strong>
          </span>
        )
      },
      { Header: "Comment", accessor: "comment", maxWidth: 300,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
      },
      { Header: "Volume", accessor: "volume", maxWidth: 140, filterable: false,
        Cell: row => (
          <span style={{ float: "right" }}>
            {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
          </span>
        ),
        sortMethod: (a, b) => { return b[0] - a[0]; 
        }, Footer: rows => (
            <span style={{ float: "right" }}>
              <strong>
                {this.getVolumeFooter(rows)}
              </strong>
            </span>
          )
      },
      { Header: "Price", accessor: "price", maxWidth: 160, filterable: false,
      Cell: row => (
        <span style={{ float: "right" }}>
          {formatUtils.formatNumber(row.value[0], 6) + " " + row.value[1]}
        </span>
      ),
      sortMethod: (a, b) => {
        return b[0] - a[0];
      }, Footer: rows => (
          <span style={{ float: "right" }}>
            <strong>
              {this.getPriceFooter(rows)}
            </strong>
          </span>
        )
      },
      { Header: "Cost", accessor: "cost", maxWidth: 140, filterable: false,
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
            {this.getCostFooter(rows)}
          </strong>
        </span>
      )},
      { Header: "Profit [%]", accessor: "profitpercentage", maxWidth: 80, filterable: false,
      Cell: row => (
        <span style={{ float: "right" }}>
          {formatUtils.toGreenRedPercentStyle(row.value)}
        </span>
      ),
      sortMethod: (a, b) => {
        return b - a;
      }, Footer: rows => (
        <span style={{ float: "right" }}>
          <strong>
            {this.getProfitPercentageFooter(rows)}
          </strong>
        </span>
      )},
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
    let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
    let tradeCount = currentPortfolio.tradeCount;

    let addTradeDialog = (
      <AddTradeDialog
        isDialogShown={this.props.isAddTradeDialogShown}
        hideDialog={this.props.hideAddTradeDialog}
        addTransaction={this.props.addTransaction}
        userModel={this.props.userModel}
        resModel={this.props.resModel}
      />
    );

    let editTradeDialog = (
      <EditTradeDialog
        isDialogShown={this.props.isEditTradeDialogShown}
        hideDialog={this.props.hideEditTradeDialog}
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
      Trades panel displays all your trades. A trade is when you exchange one currency for another. <br/><br/> 
      To add a trade, click on the Add trade button. To edit or remove a trade, click on the edit/remove icon found in ACTIONS column.<br/><br/> 
      PROFIT column will give you a trade's profit in USD for prices right now. There's also a total profit for all trades on the bottom. <br/><br/> 
      Trades can be sorted, and filtered in multiple ways. For example, to show all ETH/USD trades in 2018, enter ETH/USD in the PAIR filter, and 2018 in the DATE filter.
    </Tooltip>; 

    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="What are my recent trades?"
                rightSection={
                  <div>
                  <Button
                    // was like this for without color
                    //special
                    //simple
                    bsStyle="info"
                    fill
                    special   
                    onClick={() => this.props.showAddTradeDialog()}
                  >
                    <i className={"fa fa-plus"} /> Add trade
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
                category={tradeCount + " trade" + (tradeCount === 1 ? "" : "s")}
                content={
                  <ReactTable
                    className="-highlight"
                    data={this.state.data}
                    filterable
                    columns={this.getTableColumns()}
                    defaultPageSize={10}
                    noDataText={formatUtils.getNoDataText('trades', this.props.userModel)}                    
                  />
                }
              />
              {this.props.isAddTradeDialogShown ? addTradeDialog : ""}
              {this.props.isEditTradeDialogShown ? editTradeDialog : ""}
              {this.state.isConfirmDialogShown ? confirmRemoveTransactionDialog : ""}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default TradesView;
