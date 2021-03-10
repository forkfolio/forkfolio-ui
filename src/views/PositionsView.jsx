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
import Web3 from 'web3';
import Uniswap from '../web3/Uniswap';

class PositionsView extends Component {
  constructor(props) {
    super(props);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
    this.removeTransaction = this.removeTransaction.bind(this);
    this.loadWeb3 = this.loadWeb3.bind(this);
    this.loadWeb3Account = this.loadWeb3Account.bind(this);

    // load web3
    let web3;
    if (typeof window.web3 !== "undefined") {
      web3 = this.loadWeb3();
    }

    this.state = {
      //data: null,
      isConfirmDialogShown: false,
      removedTransaction: null,
      web3: web3,
      account: null,
      web3DataLoaded: false
    };
  }
  
  async componentWillMount() {
    console.log("Navigate to: " + window.location.pathname + window.location.hash);
    ReactGA.pageview(window.location.pathname + window.location.hash);

    // load account
    const web3 = this.state.web3;
    if (web3) {
      const userAccount = await this.loadWeb3Account(web3);
      console.log("userAccount: " + userAccount);
      this.setState({
        account: userAccount
      });
    }
  }

  loadWeb3() {
    let web3;
    if (typeof global.window !== "undefined") {
      // Modern dapp browsers...
      if (window.ethereum) {
        web3 = new Web3(window.ethereum);
      }
      // Legacy dapp browsers...
      else if (typeof global.window.web3 !== "undefined") {
        // Use Mist/MetaMask's provider
        web3 = new Web3(window.web3.currentProvider);
      } else {
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
      }
    }

    return web3;
  };
  
  async loadWeb3Account(web3) {
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      return accounts[0];
    } catch (e) {
      console.error("Unable to load web3 account. Please enable web3 wallet in your browser. Message: " + e.getMessage());
    }
  };

  async componentDidUpdate(prevState) {
    if (this.props.userModel && this.props.userModel.positions && this.state.web3) {
      // call only once
      if (!this.state.web3DataLoaded) {
        this.setState({
          web3DataLoaded: true
        });
        console.log(this.props.userModel)
        //await this.loadWeb3Data(this.props.userModel.positio ns); // here is 
        // todo: called only once, is this desireable?
        //this.setState({
        //  data: this.mapTradesToState(this.props)
        //});
      }

      /*if(this.state !== prevState) {
        this.setState({
          data: this.mapTradesToState(this.props)
        });
      }*/
    }
  }

  // safely change state here
  /*async componentWillReceiveProps(nextProps) {
    if(nextProps !== this.props && nextProps.userModel && nextProps.userModel.positions && this.state.web3) {
      await this.loadWeb3Data(nextProps.userModel.positions);

    }

    this.setState({
      data: this.mapTradesToState(nextProps)
    });
  }*/

  async loadWeb3Data(positions) {
    console.log("Loading web3 data")
    console.log(positions)
    let pos = positions[0];
    if(pos) {
      console.log(pos)
      let uniswap = new Uniswap(pos.marketAddress, pos.addressBASE, pos.addressUNDER, 0, 0, 0, 0.3);
      console.log(uniswap);
      console.log(this.state.web3)
      await uniswap.getMarketData(this.state.web3, pos);
      console.log("Loaded Uniswap")
      console.log(uniswap)
    }
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

  getSumFooter(rows, columnName) {
    let total = 0;
    for (let row of rows.data) {
      total += row[columnName][0];
    }
    return total;
  }

  getTableColumns() {
    const tableColumns = [
      { 
        Header: "Info",
        background: '#ff000042',
        columns: [
          { 
            Header: "Position", accessor: "position", minWidth: 95, maxWidth: 300,
            filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1
          },
          { 
            Header: "Liquidation", accessor: "liquidation", maxWidth: 400,
            filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
          },
          { 
            Header: "Size", accessor: "size", maxWidth: 150,
            filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 0) + " " + row.value[1]}
              </span>
            ),
            Footer: rows => (
              <span style={{ float: "right" }}>
                <strong>
                  {this.getSumFooter(rows, "size") + " " + rows.data[0]["size"][1]}
                </strong>
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; }
          },
          { 
            Header: "Active", accessor: "active", maxWidth: 80,
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
            Header: "Price", accessor: "current", maxWidth: 150, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; }
          },
          { 
            Header: "Total Profit", accessor: "totalprofitcurrent", maxWidth: 150, filterable: false,
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
            Header: "Monthly Profit", accessor: "monthlyprofitcurrent", maxWidth: 150, filterable: false,
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
            Header: "APR", accessor: "aprcurrent", maxWidth: 100, filterable: false,
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
          { Header: "Price", accessor: "target", maxWidth: 150, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; 
            }
          },
          { Header: "Total Profit", accessor: "totalprofittarget", maxWidth: 150, filterable: false,
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
          { Header: "Monthly Profit", accessor: "monthlyprofittarget", maxWidth: 150, filterable: false,
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
          { Header: "APR", accessor: "aprtarget", maxWidth: 100, filterable: false,
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
                content={this.state.data ? 
                  <ReactTable
                    className="-highlight"
                    data={this.state.data}
                    filterable
                    columns={this.getTableColumns()}
                    defaultPageSize={10}
                    noDataText={formatUtils.getNoDataText('trades', this.props.userModel)}                    
                  />
                : null}
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
