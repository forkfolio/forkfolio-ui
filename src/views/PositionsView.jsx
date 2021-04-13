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
import dYdXLong from '../web3/dYdXLong';
import dYdXShort from '../web3/dYdXShort';
import PositionChartCard from "./positions/PositionChartCard";
import { clone, debalanceETH, debalanceDAI } from '../web3/common.js';

class PositionsView extends Component {
  constructor(props) {
    super(props);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
    this.removeTransaction = this.removeTransaction.bind(this);
    this.hideChartDialog = this.hideChartDialog.bind(this);
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
      isChartDialogShown: false,
      web3: web3,
      account: null,
      web3DataLoaded: false,
      selectedPosition: null
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
    if (this.props.userModel && this.props.userModel.positions && Array.isArray(this.props.userModel.positions) && this.state.web3) {
      // call only once
      if (!this.state.web3DataLoaded) {
        console.log("Loading web3 data and setting up data for table")
        this.setState({
          web3DataLoaded: true
        });
        // NOTE: here I can create JSON objects and append to positions
        let testPosition = {
          name: "Uniswap + DYDX LONG 1x",
          startDate: "2021-02-14T15:01:00.000Z",
          base: {
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            symbol: "DAI"
          },
          under: {
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "ETH"
          },
          subpositions: [
            {
              type: "uniswap",
              marketAddress: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
              base: {
                start: 1800,
                extra: 0
              },
              under: {
                start: 1,
                extra: 0
              },
              startLIQ: 30.67
            },
            {
              type: "dydx-long",
              base: {
                start: 0,
                extra: 0
              },
              under: {
                start: 1,
                extra: 0
              },
              collateralUNDER: 1, 
              borrowedBASE: 1800, 
              boughtUNDER: 1, 
              openingPrice: 1800
            }
          ],
          description: {
            text: "some text",
            links: []
          }
        }
        /*let testPosition = {
          name: "DYDX SHORT 1x",
          startDate: "2021-02-14T15:01:00.000Z",
          base: {
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            symbol: "DAI"
          },
          under: {
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            symbol: "ETH"
          },
          subpositions: [
            {
              type: "dydx-short",
              base: {
                start: 1800,
                extra: 0
              },
              under: {
                start: 0,
                extra: 0
              },
              collateralBASE: 1800,
              borrowedUNDER: 1,
              boughtBASE: 1800,
              openingPrice: 1800
            }
          ],
          description: {
            text: "some text",
            links: []
          }
        }*/
        let appendedPositions = [...this.props.userModel.positions, testPosition];
        console.log(appendedPositions)

        // get live market data from smart contracts via web3
        await this.loadWeb3Data(appendedPositions);

        // calculate data for table
        let tableData = this.prepareTableData(appendedPositions);

        // update table
        this.setState({
          data: tableData,
          selectedPosition: appendedPositions[0]
        });
      }
    }
  }

  async loadWeb3Data(positions) {
    for(let i = 0; i < positions.length; i++) {
      let pos = positions[i];
      for(let j = 0; j < pos.subpositions.length; j++) {
        let subpos = pos.subpositions[j];
        let service;
        switch (subpos.type) {
          case "uniswap":
            service = new Uniswap(subpos.marketAddress, pos.base.address, pos.under.address, subpos.startLIQ);
            break;
          case "dydx-long":
            service = new dYdXLong(subpos.collateralUNDER, subpos.borrowedBASE, subpos.boughtUNDER, subpos.openingPrice);
            break;
          case "dydx-short":
            service = new dYdXShort(subpos.collateralBASE, subpos.borrowedUNDER, subpos.boughtBASE, subpos.openingPrice);
            break;
        }

        console.log("Service: ")
        console.log(service)
        await service.getMarketData(this.state.web3, pos);
        // todo: dirty adding to position
        subpos.service = service;
      }
    }
  }

  prepareTableData(positions) {
    let uniswapTableSet = [];
    for(let i = 0; i < positions.length; i++) {
      let pos = positions[i];
      // time 
      let startDate = new Date(pos.startDate);
      let daysSinceStart = (new Date() - startDate) / (1000 * 60 * 60 * 24);

      // find uniswap market
      let market, currentPrice;
      for(let j = 0; j < pos.subpositions.length; j++) {
        let subpos = pos.subpositions[j];
        if(subpos.type === "uniswap") {
          market = clone(subpos.service);
          currentPrice = market.getPrice();
        }
      }

      // todo: delete dirty hack
      if(!market) {
        market = {
          priceBASEUSD: 1,
          priceUNDERUSD: 2200
        }
        currentPrice = 2200;
      }


      let totalInBASE = 0, totalOutBASE = 0;//, startBASE = 0, startUNDER = 0;
      for(let j = 0; j < pos.subpositions.length; j++) {
        let subpos = pos.subpositions[j];

        // calculate Ins
        totalInBASE += subpos.base.start + subpos.under.start * currentPrice;
        //totalInUNDER += subpos.under.start + subpos.base.start / currentPrice;
        //startBASE += subpos.base.start;
        //startUNDER += subpos.under.start;

        // calculate Outs
        let extraBASE = subpos.base.extra + subpos.under.extra * currentPrice;
        totalOutBASE += subpos.service.getCurrentValue(currentPrice)[0] + extraBASE; 
      }

      // today
      let profitTodayToken = totalOutBASE - totalInBASE;				
      let profitPerMonthTodayToken = profitTodayToken * 30.4167 / daysSinceStart;						
      let aprToday = profitTodayToken / totalInBASE / daysSinceStart * 365 * 100;	


      // target BASE
      let priceAndProfitBASE = this.findMaxBASE(pos);
      let targetPriceBASE = priceAndProfitBASE[0];
      let targetProfitBASE = priceAndProfitBASE[1];
      let targetHodlBASE = priceAndProfitBASE[2];
      let profitPerMonthTargetBASE = targetProfitBASE * 30.4167 / daysSinceStart;	
      let aprTargetBASE = targetProfitBASE / targetHodlBASE / daysSinceStart * 365 * 100;
      
      // target UNDER
      let priceAndProfitUNDER = this.findMaxUNDER(pos);
      let targetPriceUNDER = priceAndProfitUNDER[0];
      let targetProfitUNDER = priceAndProfitUNDER[1];
      let targetHodlUNDER = priceAndProfitUNDER[2];
      let profitPerMonthTargetUNDER = targetProfitUNDER * 30.4167 / daysSinceStart;	
      let aprTargetUNDER = targetProfitUNDER / targetHodlUNDER / daysSinceStart * 365 * 100;

      // profits in (USD)
      let profitTargetETHUSD = targetProfitUNDER * targetPriceUNDER * market.priceBASEUSD;
      let profitTargetTokenUSD = pos.base.symbol === "DAI" || pos.base.symbol === "USDC" ? targetProfitBASE * market.priceBASEUSD : targetProfitBASE / targetPriceBASE * market.priceUNDERUSD;
      let profitPerMonthTargetETHUSD = profitPerMonthTargetUNDER * targetPriceUNDER * market.priceBASEUSD;
      let profitPerMonthTargetTokenUSD = pos.base.symbol === "DAI" || pos.base.symbol === "USDC" ? profitPerMonthTargetBASE * market.priceBASEUSD : profitPerMonthTargetBASE / targetPriceBASE * market.priceUNDERUSD;

      pos.maxProfitTargetUSD = Math.max(profitTargetETHUSD, profitTargetTokenUSD);
      pos.maxProfitPerMonthTargetUSD = Math.max(profitPerMonthTargetTokenUSD, profitPerMonthTargetETHUSD);

      // prepare dataset for table
      uniswapTableSet.push({
        id: pos,
        position: [pos.name, pos.description, pos.address], 
        sizedays: {
          size: [totalOutBASE * market.priceBASEUSD, "USD"],
          days: [daysSinceStart.toFixed(0), "days"],
        },
        price: {
          lower: [targetPriceUNDER, pos.base.symbol],
          current: [currentPrice, pos.base.symbol],
          higher: [targetPriceBASE, pos.base.symbol]
        },
        totalprofit: {
          lower: [targetProfitUNDER, pos.under.symbol, profitTargetETHUSD],
          current: [market.priceBASEUSD * profitTodayToken, "USD", market.priceBASEUSD * profitTodayToken],
          higher: [targetProfitBASE, pos.base.symbol, profitTargetTokenUSD]
        },
        monthlyprofit: {
          lower: [profitPerMonthTargetUNDER, pos.under.symbol, profitPerMonthTargetETHUSD],
          current: [market.priceBASEUSD * profitPerMonthTodayToken, "USD", market.priceBASEUSD * profitPerMonthTodayToken],
          higher: [profitPerMonthTargetBASE, pos.base.symbol, profitPerMonthTargetTokenUSD]
        },
        apr: {
          lower: [aprTargetUNDER, "%"],
          current: [aprToday, "%"],
          higher: [aprTargetBASE, "%"]
        },
        actions: (
          <div className="actions-right">
            <Button
              onClick={() => {
                this.setState({
                  isChartDialogShown: false, // todo: maybe enable later
                  selectedPosition: positions[i]
                });
                return true;
              }}
              bsStyle="default"
              table
              simple
              icon
            >
              <i className="fas fa-chart-area" />
            </Button>{" "}
            <br></br>
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
            <br></br>
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
    }

    return uniswapTableSet;
  }

  findMaxBASE(position) {
    let startPrice = 0.1;
    let endPrice = 3000;	
    let maxPrice = startPrice;			
    let maxBalanceBASE = -100000000000;
    let maxProfitBASE = -100000000000;
    let maxTotalHodlBASE = -100000000000;

    for(let i = startPrice; i < endPrice; i += 0.01) {
      let totalOutBASE = 0, startBASE = 0, startUNDER = 0;
      // get totals out
      for(let j = 0; j < position.subpositions.length; j++) {
        let subpos = position.subpositions[j];

        // get ins
        startBASE += subpos.base.start;
        startUNDER += subpos.under.start;

        // get outs
        let extraBASE = subpos.base.extra + subpos.under.extra * i;
        totalOutBASE += subpos.service.getCurrentValue(i)[0] + extraBASE;
      }

      // debalance for max BASE
      let debalanced = debalanceDAI(i, startUNDER, 0, totalOutBASE);
      //console.log("debalanced @" + i.toFixed(3) + ": " + debalanced[0].toFixed(4) + " UNDER + " + debalanced[1].toFixed(4) + " BASE");
      if(maxBalanceBASE < debalanced[1]) {
        maxBalanceBASE = debalanced[1];
        maxProfitBASE = debalanced[1] - startBASE;
        maxPrice = i;
        maxTotalHodlBASE = startBASE + startUNDER * maxPrice;
      }
    }

    return [maxPrice, maxProfitBASE, maxTotalHodlBASE];
  }

  findMaxUNDER(position) {
    let startPrice = 0.1;
    let endPrice = 3000;	
    let maxPrice = startPrice;			
    let maxBalanceUNDER = -100000000000;
    let maxProfitUNDER = -100000000000;
    let maxTotalHodlUNDER = -100000000000;

    for(let i = startPrice; i < endPrice; i += 0.01) {
      let totalOutUNDER = 0, startBASE = 0, startUNDER = 0;
      // get totals out
      for(let j = 0; j < position.subpositions.length; j++) {
        let subpos = position.subpositions[j];

        // get ins
        startBASE += subpos.base.start;
        startUNDER += subpos.under.start;

        // get outs
        let extraUNDER = subpos.under.extra + subpos.base.extra / i;
        totalOutUNDER += subpos.service.getCurrentValue(i)[1] + extraUNDER;
      }

      // debalance for max UNDER
      let debalanced = debalanceETH(i, startBASE, totalOutUNDER, 0);
      //console.log("debalanced @" + i.toFixed(3) + ": " + debalanced[0].toFixed(4) + " ETH + " + debalanced[1].toFixed(4) + " COMP");
      if(maxBalanceUNDER < debalanced[0]) {
        maxBalanceUNDER = debalanced[0];
        maxProfitUNDER = debalanced[0] - startUNDER;
        maxPrice = i;
        maxTotalHodlUNDER = startBASE / maxPrice + startUNDER;
      }
    }

    return [maxPrice, maxProfitUNDER, maxTotalHodlUNDER];
  }

  getTotalProfitSum() {
    let sumA = 0;
    for(let i = 0; i < this.props.userModel.positions.length; i++) {
      if(this.props.userModel.positions[i].maxProfitTargetUSD) {
        sumA += this.props.userModel.positions[i].maxProfitTargetUSD;
      } 
    }
    
    return sumA;
  };

  getMonthlyProfitSum() {
    let sumA = 0;
    for(let i = 0; i < this.props.userModel.positions.length; i++) {
      if(this.props.userModel.positions[i].maxProfitPerMonthTargetUSD) {
        sumA += this.props.userModel.positions[i].maxProfitPerMonthTargetUSD;
      }
    }
    
    return sumA;
  };

  getSumFooter(rows, columnName, subName, index) {
    let total = 0;
    for (let row of rows.data) {
      total += row[columnName][subName][index];
    }
    return total;
  }

  
  displayLinks = (description) => {
    return (
      description.links.map((link, key) => {
        return (
          <span key={key}>
            <a href={link.link}>{link.anchor}</a>{" "}
          </span>
        );
      })
    )
  };

  getTableColumns() {
    const tableColumns = [
      { 
        Header: "Position", accessor: "position", maxWidth: 550, style: { 'whiteSpace': 'unset' },
        filterMethod: (filter, row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1,
        Cell: row => {
          return (
            <span style={{ float: "left" }}>
              <b>{row.value[0]}</b><br></br>
              {row.value[1].text}<br></br>
              {this.displayLinks(row.value[1])}
              <a href={"https://zapper.fi/dashboard?address=" + row.value[2]}>Zap</a>
            </span>
          )
        },
      },
      { 
        Header: "Size/Days", accessor: "sizedays", maxWidth: 120, filterable: false,
        Cell: row => (
          <div>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.size[0], 0) + " " + row.value.size[1]}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.days[0], 0) + " " + row.value.days[1]}
            </div>
          </div>
        ),
        Footer: rows => (
          <span style={{ float: "right" }}>
            <strong>
              {formatUtils.formatNumber(this.getSumFooter(rows, "sizedays", "size", 0), 0) + " " + rows.data[0]["sizedays"]["size"][1]}
            </strong>
          </span>
        ),
        sortMethod: (a, b) => { return b[0] - a[0]; }
      },
      { 
        Header: "Price", accessor: "price", maxWidth: 130, filterable: false,
        Cell: row => (
          <div>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.lower[0], 2) + " " + row.value.lower[1]}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.current[0], 2) + " " + row.value.current[1]}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.higher[0], 2) + " " + row.value.higher[1]}
            </div>
          </div>
        ),
        sortMethod: (a, b) => { return b[0] - a[0]; },
        Footer: rows => (
          <div>
            <div style={{ float: "right" }}>
              @current
            </div>
            <br/>
            <div style={{ float: "right" }}>
              @target
              </div>
          </div>
        )
      },
      { 
        Header: "Total Profit", accessor: "totalprofit", maxWidth: 350, filterable: false,
        Cell: row => (
          <div>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.lower[0], 0) + " " + row.value.lower[1] + " (" + formatUtils.formatNumber(row.value.lower[2], 0) + " USD)"}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.current[0], 0) + " " + row.value.current[1] + " (" + formatUtils.formatNumber(row.value.current[2], 0) + " USD)"}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.higher[0], 0) + " " + row.value.higher[1] + " (" + formatUtils.formatNumber(row.value.higher[2], 0) + " USD)"}
            </div>
          </div>
        ),
        sortMethod: (a, b) => { return b[0] - a[0]; }, 
        Footer: rows => (
          <div>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(this.getSumFooter(rows, "totalprofit", "current", 0), 0) + " " + rows.data[0]["totalprofit"]["current"][1]}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(this.getTotalProfitSum(), 0) + " " + rows.data[0]["totalprofit"]["current"][1]}
            </div>
          </div>
        )
      },
      { 
        Header: "Monthly Profit", accessor: "monthlyprofit", maxWidth: 350, filterable: false,
        Cell: row => (
          <div>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.lower[0], 0) + " " + row.value.lower[1] + " (" + formatUtils.formatNumber(row.value.lower[2], 0) + " USD)"}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.current[0], 0) + " " + row.value.current[1] + " (" + formatUtils.formatNumber(row.value.current[2], 0) + " USD)"}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.higher[0], 0) + " " + row.value.higher[1] + " (" + formatUtils.formatNumber(row.value.higher[2], 0) + " USD)"}
            </div>
          </div>
        ),
        sortMethod: (a, b) => { return b[0] - a[0]; }, 
        Footer: rows => (
          <div>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(this.getSumFooter(rows, "monthlyprofit", "current", 0), 0) + " " + rows.data[0]["monthlyprofit"]["current"][1]}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(this.getMonthlyProfitSum(), 0) + " " + rows.data[0]["monthlyprofit"]["current"][1]}
            </div>
          </div>
        )
      },
      { 
        Header: "APR", accessor: "apr", maxWidth: 70, filterable: false,
        Cell: row => (
          <div>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.lower[0], 2) + "" + row.value.lower[1]}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.current[0], 2) + "" + row.value.current[1]}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(row.value.higher[0], 2) + "" + row.value.higher[1]}
            </div>
          </div>
        ),
        sortMethod: (a, b) => { return b - a; },
        Footer: rows => (
          <div>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(this.getSumFooter(rows, "monthlyprofit", "current", 0) * 12 / this.getSumFooter(rows, "sizedays", "size", 0) * 100, 2) + "%"}
            </div>
            <br/>
            <div style={{ float: "right" }}>
              {formatUtils.formatNumber(this.getMonthlyProfitSum() * 12 / this.getSumFooter(rows, "sizedays", "size", 0) * 100, 2) + "%"}
            </div>
          </div>
        )
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

  hideChartDialog() {
    this.setState({
      isChartDialogShown: false
    });
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
                  <span>
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
                  </span>
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
          <Row>
            <Col md={12}>
              <PositionChartCard 
                selectedPosition={this.state.selectedPosition}
                userModel={this.props.userModel}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default PositionsView;
