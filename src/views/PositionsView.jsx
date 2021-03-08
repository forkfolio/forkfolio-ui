import React, { Component } from "react";
// react component for creating dynamic tables
import ReactTable from "react-table";
import { Grid, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import AddTradeDialog from "./dialogs/AddTradeDialog";
import EditTradeDialog from "./dialogs/EditTradeDialog";
import ConfirmRemoveTransactionDialog from "./dialogs/ConfirmRemoveTransactionDialog";
import { formatUtils } from '../utils/FormatUtils';
import ReactGA from 'react-ga';

class PositionsView extends Component {
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
    // temp to test
    tableData.push([
      0, 
      "(MM1) - mMSFT-UST - Mirror",
      "Watch mirror.finance, Stock prices, Zapper",
      [359798, "USD"],
      [35, "days"],
      [233.463,  "UST"],
      [81722.89, "USD"],
      [71307.28, "USD"],
      [237.82, "%"],
      [233.463, "UST"],
      [81722.89, "USD"],
      [71307.28, "USD"],
      [287.82, "%"]
    ]);

    tableData.push([
      1, 
      "(MM2) - mGOOG-UST - Mirror",
      "Watch mirror.finance, Stock prices, Zapper",
      [159798, "USD"],
      [15, "days"],
      [133.463,  "UST"],
      [11722.89, "USD"],
      [11307.28, "USD"],
      [137.82, "%"],
      [133.463, "UST"],
      [11722.89, "USD"],
      [11307.28, "USD"],
      [187.82, "%"]
    ]);
    /*let newestFirst = props.userModel.transactions.slice(0, props.userModel.transactions.length);
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
    }*/


    // second, map to state
    return tableData.map((prop, key) => {
      return {
        id: prop[0],
        position: prop[1],
        liquidation: prop[2],
        size: prop[3],
        active: prop[4],
        current: prop[5],
        totalprofitcurrent: prop[6],
        monthlyprofitcurrent: prop[7],
        aprcurrent: prop[8],
        target: prop[9],
        totalprofittarget: prop[10],
        monthlyprofittarget: prop[11],
        aprtarget: prop[12],
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

  getSumFooter(rows, columnName) {
    let total = 0;
    for (let row of rows.data) {
      total += row[columnName][0];
    }
    return total;
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


  /* 
    { title: "Position" },
    { title: "Share/Liquidation" },
    { title: "Size" },
    { title: "Active" },
    { title: "@Current" },
    { title: "Total Profit @Current" },
    { title: "Monthly Profit @Current" },						
    { title: "APR @Current" },
    { title: "@Target" },
    { title: "Total Profit @Target" },
    { title: "Monthly Profit @Target" },					
    { title: "APR @Target" }
  */
  getTableColumns() {
    const tableColumns = [
      { 
        Header: "Info",
        background: '#ff000042',
        columns: [
          { 
            Header: "Position", accessor: "position", minWidth: 95, maxWidth: 100,
            filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
          },
          { 
            Header: "Liquidation", accessor: "liquidation", maxWidth: 100,
            filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
          },
          { 
            Header: "Size", accessor: "size", maxWidth: 50,
            filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
              </span>
            ),
            Footer: rows => (
              <span>
                <strong>
                  {this.getSumFooter(rows, "size") + " " + rows.data[0]["size"][1]}
                </strong>
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; }
          },
          { 
            Header: "Active", accessor: "active", maxWidth: 30,
            filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 0) + " " + row.value[1]}
              </span>
            ),
          },
        ]
      },
      { 
        Header: "Current",
        columns: [
          { 
            Header: "@Current", accessor: "current", maxWidth: 150, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; }
          },
          { 
            Header: "Total Profit @Current", accessor: "totalprofitcurrent", maxWidth: 150, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 0) + " " + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; }, 
            Footer: rows => (
              <span style={{ float: "right" }}>
                <strong>
                  {this.getSumFooter(rows, "totalprofitcurrent") + " " + rows.data[0]["totalprofitcurrent"][1]}
                </strong>
              </span>
            )
          },
          { 
            Header: "Monthly Profit @Current", accessor: "monthlyprofitcurrent", maxWidth: 150, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; }, 
            Footer: rows => (
              <span style={{ float: "right" }}>
                <strong>
                  {this.getSumFooter(rows, "monthlyprofitcurrent") + " " + rows.data[0]["monthlyprofitcurrent"][1]}
                </strong>
              </span>
            )
          },
          { 
            Header: "APR @Current", accessor: "aprcurrent", maxWidth: 100, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 2) + "" + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b - a;
            }
          },
        ]
      },
      { 
        Header: "Target",
        columns: [
          { Header: "@Target", accessor: "target", maxWidth: 150, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; 
            }
          },
          { Header: "Total Profit @Target", accessor: "totalprofittarget", maxWidth: 150, filterable: false,
          Cell: row => (
            <span style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value[0], 0) + " " + row.value[1]}
            </span>
          ),
          sortMethod: (a, b) => { return b[0] - a[0];
          }, Footer: rows => (
              <span style={{ float: "right" }}>
                <strong>
                  {this.getSumFooter(rows, "totalprofittarget") + " " + rows.data[0]["totalprofittarget"][1]}
                </strong>
              </span>
            )
          },
          { Header: "Monthly Profit @Target", accessor: "monthlyprofittarget", maxWidth: 150, filterable: false,
          Cell: row => (
            <span style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
            </span>
          ),
          sortMethod: (a, b) => { return b[0] - a[0];
          }, Footer: rows => (
            <span style={{ float: "right" }}>
              <strong>
                {this.getSumFooter(rows, "monthlyprofittarget") + " " + rows.data[0]["monthlyprofittarget"][1]}
              </strong>
            </span>
          )},
          { Header: "APR @Target", accessor: "aprtarget", maxWidth: 100, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 2) + "" + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b - a;
            }
          }
        ]
      }, 
      { 
        Header: "Actions", accessor: "actions", minWidth: 70, maxWidth: 70, sortable: false, filterable: false 
      }
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
      123 help
    </Tooltip>; 

    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="What are my opened positions?"
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

export default PositionsView;
