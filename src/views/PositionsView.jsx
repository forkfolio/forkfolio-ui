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

  async componentDidUpdate() {
    console.log("componentDidUpdate called")
    if (this.props.userModel && this.props.userModel.positions && Array.isArray(this.props.userModel.positions) && this.state.web3) {
      // call only once
      if (!this.state.web3DataLoaded) {
        console.log("Loading web3 data and setting up data for table")
        this.setState({
          web3DataLoaded: true
        });
        console.log(this.props.userModel.positions)
        let markets = await this.loadWeb3Data();
        // todo: called only once, is this desireable?
        this.refreshUniswapPositions(this.props.userModel.positions, markets);
      }
    }
  }

  async loadWeb3Data() {
    let markets = [];
    for(let i = 0; i < this.props.userModel.positions.length; i++) {
      let pos = this.props.userModel.positions[i];
      let uniswap = new Uniswap(pos.marketAddress, pos.addressBASE, pos.addressUNDER, 0, 0, 0, 0.3);
      await uniswap.getMarketData(this.state.web3, pos);
      markets.push(uniswap);
    }

    return markets;
  }

  refreshUniswapPositions(positions, markets) {
    let uniswapTableSet = [];
    for(let i = 0; i < positions.length; i++) {
      let market = markets[i];
      console.log(market)
      // time 
      let startDate = new Date(positions[i].startDate);
      let daysSinceStart = (new Date() - startDate) / (1000 * 60 * 60 * 24);

      // calculate Ins
      let dydxInETH = positions[i].longPos[0] / positions[i].longPos[1];
      let totalInETH = positions[i].startUNDER + dydxInETH;
      let totalInTKN = positions[i].startBASE;
      
      // calculate Outs
      let uniswapOutETH = positions[i].currentLPT * market.priceLIQUNDER;
      let uniswapOutTKN = positions[i].currentLPT * market.priceLIQBASE;

      let dydxOutETH = this.getDyDxLongBalanceInETH(positions[i].longPos[0], positions[i].longPos[1], positions[i].longPos[2], market.priceUNDERBASE);

      let totalOutETH = uniswapOutETH + dydxOutETH + positions[i].extraUNDER;	
      let totalOutTKN = uniswapOutTKN + positions[i].extraBASE;
      let balanceTodayToken = totalOutETH * market.priceUNDERBASE + totalOutTKN;	
      
      // today
      let profitTodayToken = (totalOutETH - totalInETH) * market.priceUNDERBASE + (totalOutTKN - totalInTKN);				
      let profitPerMonthTodayToken = profitTodayToken * 30.4167 / daysSinceStart;						
      let aprToday = profitTodayToken / balanceTodayToken / daysSinceStart * 365 * 100;	

      // target token
      let maximumsToken = this.findPriceAndProfitForMaxToken(market, positions[i]);
      let targetPriceToken = maximumsToken[0];
      let profitTargetToken = maximumsToken[1];
      let balanceToken = totalInTKN + totalInETH * targetPriceToken;
      let profitPerMonthTargetToken = profitTargetToken * 30.4167 / daysSinceStart;	
      let aprTargetToken = profitTargetToken / balanceToken / daysSinceStart * 365 * 100;
      
      // target ETH
      let maximumsETH = this.findPriceAndProfitForMaxETH(market, positions[i]);
      let targetPriceETH = maximumsETH[0];
      let profitTargetETH = maximumsETH[1];
      let balanceETH = totalInETH + totalInTKN / targetPriceETH;
      let profitPerMonthTargetETH = profitTargetETH * 30.4167 / daysSinceStart;	
      let aprTargetETH = profitTargetETH / balanceETH / daysSinceStart * 365 * 100;

      // profits in (USD)
      let profitTargetETHUSD = profitTargetETH * targetPriceETH * market.priceBASEUSD;
      let profitTargetTokenUSD = positions[i].symbolBASE == "DAI" || positions[i].symbolBASE == "USDC" ? profitTargetToken * market.priceBASEUSD : profitTargetToken / targetPriceToken * market.priceUNDERUSD;
      let profitPerMonthTargetETHUSD = profitPerMonthTargetETH * targetPriceETH * market.priceBASEUSD;
      let profitPerMonthTargetTokenUSD = positions[i].symbolBASE == "DAI" || positions[i].symbolBASE == "USDC" ? profitPerMonthTargetToken * market.priceBASEUSD : profitPerMonthTargetToken / targetPriceToken * market.priceUNDERUSD;

      positions[i].maxProfitTargetUSD = Math.max(profitTargetETHUSD, profitTargetTokenUSD);
      positions[i].maxProfitPerMonthTargetUSD = Math.max(profitPerMonthTargetTokenUSD, profitPerMonthTargetETHUSD);

      // prepare dataset for table
      uniswapTableSet.push({
        id: i,
        position: [positions[i].name, positions[i].description], 
        size: [balanceTodayToken * market.priceBASEUSD, "USD"],
        days: [daysSinceStart.toFixed(0), "d"],
        current: [market.priceUNDERBASE, positions[i].symbolBASE],
        totalprofitcurrent: [market.priceBASEUSD * profitTodayToken, "USD"],
        monthlyprofitcurrent: [market.priceBASEUSD * profitPerMonthTodayToken, "USD"],
        aprcurrent: [aprToday, "%"],
        target: [targetPriceETH, positions[i].symbolBASE, targetPriceToken, positions[i].symbolBASE],
        totalprofittarget: [profitTargetETH, positions[i].symbolUNDER, profitTargetETHUSD, profitTargetToken, positions[i].symbolBASE, profitTargetTokenUSD], 
        monthlyprofittarget: [profitPerMonthTargetETH, positions[i].symbolUNDER, profitPerMonthTargetETHUSD, profitPerMonthTargetToken, positions[i].symbolBASE, profitPerMonthTargetTokenUSD], 
        aprtarget: [aprTargetETH, "%"],
        actions: (
          <div className="actions-right">
            <Button
              onClick={() => {
                //this.props.setEditedTransaction(this.state.data[key].id);
                //this.props.showEditTradeDialog();
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
                  //removedTransaction: this.state.data[key].id
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
      });
        
      
      // update time and price
      //if(positions[i].marketAddress === uniswapV2DAIWETHAddress) {
      //  document.getElementById("priceAndTime").innerHTML = "Price: " + market.priceUNDERBASE.toFixed(2) + " DAI - " + new Date().toLocaleString();  	
      //}
    }

    console.log("Uniswap positions refreshed");
    this.setState({
      data: uniswapTableSet
    });
  }

  linksToString(links) {
    let linkString = "";
    for(let i = 0; i < links.length; i++) {
      linkString += '<a href="' + links[i].link + '">' + links[i].anchor + '</a>, ';
    }

    return linkString;
  }

  /*
  *	Finds the price and profit at which uniswap + long position 
  *	yield maximum token returns. 
  */
  findPriceAndProfitForMaxToken(market, position) {
    let startPrice = 0.1;
    let endPrice = 3000;	
    let maxProfitPrice = startPrice;			
    let maxBalanceDAI = -100000000000;
    let maxDebalanced;
    let totalInETH = position.startUNDER + position.longPos[0] / position.longPos[1];
    for(let i = startPrice; i < endPrice; i += 0.01) {
      market.setMarketPrice(i);

      // get uniswap balance
      let uniBalances = this.checkBalances(market, position.currentLPT);
      //console.log("optimum @" + i.toFixed(3) + ": " + uniBalances[0].toFixed(4) + " ETH + " + uniBalances[1].toFixed(4) + " COMP");

      // get dydx balance
      let longBalETH = this.getDyDxLongBalanceInETH(position.longPos[0], position.longPos[1], position.longPos[2], i);

      // debalance for max dai
      let debalanced = this.debalanceDAI(market, totalInETH, uniBalances[0] + longBalETH + position.extraUNDER, uniBalances[1] + position.extraBASE);
      //console.log("debalanced @" + i.toFixed(3) + ": " + debalanced[0].toFixed(4) + " ETH + " + debalanced[1].toFixed(4) + " COMP");
      if(maxBalanceDAI < debalanced[1]) {
        maxBalanceDAI = debalanced[1];
        maxProfitPrice = i;
        maxDebalanced = debalanced;
      }
    }			
    //console.log(position.name + ": max balance: " + maxBalanceDAI + " DAI: @" + maxProfitPrice);
    console.log(position.name + " for max TKN: " + maxDebalanced);
    
    return [maxProfitPrice, maxBalanceDAI - position.startBASE];
  }
  
  /*
  *	Finds the price and profit at which uniswap + long position 
  *	yield maximum ETH returns. 
  */
  findPriceAndProfitForMaxETH(market, position) {
    let startPrice = 0.1;
    let endPrice = 3000;		
    let maxProfitPrice = startPrice;		
    let maxBalanceETH = -100000000000;
    let maxDebalanced;
    let totalInETH = position.startUNDER + position.longPos[0] / position.longPos[1];
    for(let i = startPrice; i < endPrice; i += 0.01) {
      market.setMarketPrice(i);

      // get uniswap balance
      let uniBalances = this.checkBalances(market, position.currentLPT);
      //console.log("ETH optimum @" + i + ": " + uniBalances[0].toFixed(4) + " ETH + " + uniBalances[1].toFixed(2) + " DAI");

      // get dydx balance
      let longBalETH = this.getDyDxLongBalanceInETH(position.longPos[0], position.longPos[1], position.longPos[2], i);

      // debalance for max dai
      let debalanced = this.debalanceETH(market, position.startBASE, uniBalances[0] + longBalETH + position.extraUNDER, uniBalances[1] + position.extraBASE);
      //console.log("Profit in DAI @" + i + ": " + ((debalanced[0] - position.startUNDER)  * i).toFixed(3) + " DAI = " + (debalanced[0] - position.startUNDER).toFixed(5) + " ETH")
      if(maxBalanceETH < debalanced[0]) {
        maxBalanceETH = debalanced[0];
        maxProfitPrice = i;
        maxDebalanced = debalanced;
      }
    }			
    //console.log(position.name + ": max balance: " + maxBalanceETH + " ETH: @" + maxProfitPrice);
    console.log(position.name + " for max ETH: " + maxDebalanced);
    
    return [maxProfitPrice, maxBalanceETH - totalInETH]; 
  }

  checkBalances(market, balanceLPT) {
    let balanceETH = balanceLPT * market.poolUNDER / market.poolLIQ;
    let balanceToken = balanceLPT * market.poolBASE / market.poolLIQ;
    return [balanceETH, balanceToken];
  }

  getDyDxLongBalanceInETH(size, leverage, openPrice, currentPrice) {
    let depositETH = size / leverage;
    let marketBuyETH = size - depositETH;
    let debtDAI = marketBuyETH * openPrice;
    let currentDAI = size * currentPrice - debtDAI;
    let currentETH = currentDAI / currentPrice;

    return Math.max(0, currentETH);
  }

  getDyDxShortBalanceInDAI(size, leverage, openPrice, currentPrice) {
    let depositDAI = size * openPrice / leverage;
    let marketBuyDAI = size * openPrice - depositDAI;
    let debtETH = marketBuyDAI / openPrice;
    let currentDAI = size * openPrice - debtETH * currentPrice;

    return Math.max(0, currentDAI);
  }
  
  debalanceETH(market, startBASE, ethTokens, daiTokens) {
    let currentPrice = (market.poolBASE / market.poolUNDER);
    let diffDai = startBASE - daiTokens;
    let newETH = ethTokens - diffDai / currentPrice;
    
    return [newETH, startBASE];
  }
  
  debalanceDAI(market, startUNDER, ethTokens, daiTokens) {
    let currentPrice = (market.poolBASE / market.poolUNDER);
    let diffETH = startUNDER - ethTokens;
    let newDAI = daiTokens - diffETH * currentPrice;
    
    return [startUNDER, newDAI];
  }

  getColumn9Sum() {
    console.log(this.props.userModel.positions)
    let sumA = 0;
    for(let i = 0; i < this.props.userModel.positions.length; i++) {
      if(this.props.userModel.positions[i].maxProfitTargetUSD) {
        sumA += this.props.userModel.positions[i].maxProfitTargetUSD;
      } 
    }
    
    return sumA;
  };

  getColumn10Sum() {
    let sumA = 0;
    for(let i = 0; i < this.props.userModel.positions.length; i++) {
      if(this.props.userModel.positions[i].maxProfitPerMonthTargetUSD) {
        sumA += this.props.userModel.positions[i].maxProfitPerMonthTargetUSD;
      }
    }
    
    return sumA;
  };

  getSumFooter(rows, columnName) {
    let total = 0;
    for (let row of rows.data) {
      total += row[columnName][0];
    }
    return total;
  }

  
  displayLinks = (description) => {
    return (
      description.links.map(link => {
        return (
          <div>
            <a href={link.link}>{link.anchor}</a><br></br>
          </div>
        );
      })
    )
  };

  getTableColumns() {
    const tableColumns = [
      { 
        Header: "Info",
        background: '#ff000042',
        columns: [
          { 
            Header: "Position", accessor: "position", maxWidth: 550, style: { 'whiteSpace': 'unset' },
            filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
            Cell: row => {
              return (
                <span style={{ float: "left" }}>
                  <b>{row.value[0]}</b><br></br>
                  {row.value[1].text}<br></br>
                  {this.displayLinks(row.value[1])}
                </span>
              )
            },
          },
          { 
            Header: "Size", accessor: "size", maxWidth: 120, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 0) + " " + row.value[1]}
              </span>
            ),
            Footer: rows => (
              <span style={{ float: "right" }}>
                <strong>
                  {formatUtils.formatNumber(this.getSumFooter(rows, "size"), 0) + " " + rows.data[0]["size"][1]}
                </strong>
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; }
          },
          { 
            Header: "Days", accessor: "days", maxWidth: 60, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 0) + "" + row.value[1]}
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
                  {formatUtils.formatNumber(this.getSumFooter(rows, "totalprofitcurrent"), 0) + " " + rows.data[0]["totalprofitcurrent"][1]}
                </strong>
              </span>
            )
          },
          { 
            Header: "Monthly Profit", accessor: "monthlyprofitcurrent", maxWidth: 150, filterable: false,
            Cell: row => (
              <span style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 0) + " " + row.value[1]}
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; }, 
            Footer: rows => (
              <span style={{ float: "right" }}>
                <strong>
                  {formatUtils.formatNumber(this.getSumFooter(rows, "monthlyprofitcurrent"), 0) + " " + rows.data[0]["monthlyprofitcurrent"][1]}
                </strong>
              </span>
            )
          },
          { 
            Header: "APR", accessor: "aprcurrent", maxWidth: 70, filterable: false,
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
                <br></br>
                {formatUtils.formatNumber(row.value[2], 2) + " " + row.value[3]}
              </span>
            ),
            sortMethod: (a, b) => { return b[0] - a[0]; 
            }
          },
          { Header: "Total Profit", accessor: "totalprofittarget", maxWidth: 250, filterable: false,
          Cell: row => (
            <div>
              <div style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 0) + " " + row.value[1] + " (" + formatUtils.formatNumber(row.value[2], 0) + " USD)"}
              </div>
              <br/>
              <div style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[3], 0) + " " + row.value[4] + " (" + formatUtils.formatNumber(row.value[5], 0) + " USD)"}
              </div>
            </div>
          ),
          sortMethod: (a, b) => { return b[0] - a[0];
          }, Footer: rows => (
              <span style={{ float: "right" }}>
                <strong>
                  {formatUtils.formatNumber(this.getColumn9Sum(), 0) + " USD"}
                </strong>
              </span>
            )
          },
          { Header: "Monthly Profit", accessor: "monthlyprofittarget", maxWidth: 250, filterable: false,
          Cell: row => (
            <div>
              <div style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[0], 0) + " " + row.value[1] + " (" + formatUtils.formatNumber(row.value[2], 0) + " USD)"}
              </div>
              <br/>
              <div style={{ float: "right" }}>
                {formatUtils.formatNumber(row.value[3], 0) + " " + row.value[4] + " (" + formatUtils.formatNumber(row.value[5], 0) + " USD)"}
              </div>
            </div>
          ),
          sortMethod: (a, b) => { return b[0] - a[0];
          }, Footer: rows => (
            <span style={{ float: "right" }}>
              <strong>
                {formatUtils.formatNumber(this.getColumn10Sum(), 0) + " USD"}
              </strong>
            </span>
          )},
          { Header: "APR", accessor: "aprtarget", maxWidth: 70, filterable: false,
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
