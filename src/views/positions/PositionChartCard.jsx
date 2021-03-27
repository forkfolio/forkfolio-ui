import React, { Component } from "react";
// react component for creating dynamic tables
import { Grid, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import { formatUtils } from '../../utils/FormatUtils';
import Uniswap from '../../web3/Uniswap';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { clone, uniswapV2USDCWETHAddress, checkBalances, getDyDxLongBalanceInETH, getDyDxShortBalanceInDAI, debalanceETH, debalanceDAI } from '../../web3/common.js';

class PositionChartCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartLoaded: false,
      chartData: [Math.random() * 5, 2, 1]
    };
  }

  async componentDidUpdate(prevProps) {
    console.log("componentDidUpdate called")
    if (this.userModelLoaded() && this.props.markets) {
      // call only once
      if(!this.state.chartLoaded) {
        console.log("Refreshing chart data")
        let datasets = this.prepareChartData();
        console.log(datasets)
      
        this.setState({
          chartLoaded: true,
          chartData: datasets[1]
        });
      }
    }
  }

  userModelLoaded() {
    let userModel = this.props.userModel;
    return userModel && userModel.positions && Array.isArray(userModel.positions);
  }

  prepareChartData() {
    let uniswapProfitPercentage = 20;//new Number(document.getElementById("add_profit").value);

    console.log(">>>> Sim for 0% APR")
    let usdcWethMarket;
    // find USDC-WETH
    for(let i = 0; i < this.props.markets.length; i++) {
      if(this.props.markets[i].marketAddress === uniswapV2USDCWETHAddress) {
        usdcWethMarket = clone(this.props.markets[i]);
      }
    }
    let datasets = this.prepareDataset(20, usdcWethMarket);
    //console.log(">>>> Sim for " + uniswapProfitPercentage + "% APR")
    //prepareDataset(uniswapProfitPercentage * daysPass / 365, balancesAfter30DaysETH, balancesAfter30DaysTKN);

    return [datasets[0], datasets[1]];
  }

  prepareDataset(apyPercentage, market) {
    let balanceArrayETH = [], balanceArrayTKN = [];

    let openPrice = (market.poolBASE / market.poolUNDER);
    console.log(openPrice)
    
    // inputs for profit taking currency
    let e = document.getElementById("profit_taking_currency");
    let isTokenProfitTakingCurrency = true;//e.options[e.selectedIndex].value == "token";

    // inputs for uniswap
    let uniswapInTKN = openPrice; //new Number(document.getElementById("uniswap_tkn").value);
    let uniswapInETH = 1; //new Number(document.getElementById("uniswap_eth").value);

    // inputs for dydx
    let dydxLongSize = 0; //new Number(document.getElementById("dydx_long_size").value);
    let dydxLongLeverage = 1; //new Number(document.getElementById("dydx_long_leverage").value);
    let dydxLongInETH = dydxLongSize / dydxLongLeverage;

    let dydxShortSize = 0; //new Number(document.getElementById("dydx_short_size").value);
    let dydxShortLeverage = 1; //new Number(document.getElementById("dydx_short_leverage").value);
    let dydxShortInTKN = dydxShortSize * openPrice / dydxShortLeverage;
  
    // inputs for options
    // let option1Quantity = new Number(document.getElementById("option1_quantity").value);
    // let e1 = document.getElementById("option1_call_put");
    // let isOption1Call = e1.options[e1.selectedIndex].value;
    // let option1Strike = new Number(document.getElementById("option1_strike").value);
    // let option1DaysToExpiry = new Number(document.getElementById("option1_days_to_expiry").value);
    // let option1Volatility = new Number(document.getElementById("option1_volatility").value);
    let option1InTKN = 0; //option1Quantity * optionMath.blackScholes(isOption1Call, openPrice, option1Strike, option1DaysToExpiry / 365, 0.02, option1Volatility / 100);
    console.log("Option1InTKN: " + option1InTKN)

    // let option2Quantity = new Number(document.getElementById("option2_quantity").value);
    // let e2 = document.getElementById("option2_call_put");
    // let isOption2Call = e2.options[e2.selectedIndex].value;
    // let option2Strike = new Number(document.getElementById("option2_strike").value);
    // let option2DaysToExpiry = new Number(document.getElementById("option2_days_to_expiry").value);
    // let option2Volatility = new Number(document.getElementById("option2_volatility").value);
    let option2InTKN = 0; //option2Quantity * optionMath.blackScholes(isOption2Call, openPrice, option2Strike, option2DaysToExpiry / 365, 0.02, option2Volatility / 100);
    console.log("option2InTKN: " + option2InTKN)

    let optionInETH = 0;

    // calculate totals In
    let totalInETH = uniswapInETH + dydxLongInETH + optionInETH;
    let totalInTKN = uniswapInTKN + dydxShortInTKN + option1InTKN + option2InTKN;

    console.log("Total in: " + totalInETH + " ETH + " + totalInTKN + " TKN");


    // rebalance before adding liquidity on uniswap
    let rebalancedTKN = (uniswapInTKN + uniswapInETH * openPrice) / 2;
    let rebalancedETH = rebalancedTKN / openPrice;
    console.log("Rebalanced: " + rebalancedETH + " ETH + " + rebalancedTKN + " TKN");
    let lptTokens = market.addLiquidity(rebalancedETH, rebalancedTKN);

    // apply uniswap profit
    market.poolBASE += market.poolBASE * apyPercentage / 100;
    market.poolUNDER += market.poolUNDER * apyPercentage / 100;

    balanceArrayETH.splice(0, balanceArrayETH.length);
    balanceArrayTKN.splice(0, balanceArrayTKN.length);
    let startPrice = 10, endPrice = 3000;
    let priceForMaxTKN = 0, priceForMaxETH = 0;	
    let maxBalanceETH = -1000000, maxBalanceTKN = -1000000;
    for(let i = startPrice; i < endPrice; i += 10) {
      market.setMarketPrice(i);

      // get uniswap
      let uniswapOuts = checkBalances(market, lptTokens);
      //console.log("Optimum @" + i + ": " + uniswapOuts[0].toFixed(4) + " ETH + " + uniswapOuts[1].toFixed(2) + " DAI");

      // get dydx
      let dydxOutETH = getDyDxLongBalanceInETH(dydxLongSize, dydxLongLeverage, openPrice, i);
      let dydxOutTKN = getDyDxShortBalanceInDAI(dydxShortSize, dydxShortLeverage, openPrice, i);

      // get options
      let optionOutETH = 0;
      let option1OutTKN = 0; //option1Quantity * optionMath.blackScholes(isOption1Call, i, option1Strike, (option1DaysToExpiry - daysPass) / 365, 0.02, option1Volatility / 100);
      //console.log("Option1 value @ " + i + ": " + option1OutTKN);
      let option2OutTKN = 0; //option2Quantity * optionMath.blackScholes(isOption2Call, i, option2Strike, (option2DaysToExpiry - daysPass) / 365, 0.02, option2Volatility / 100);
      //console.log("Option2 value @ " + i + ": " + option2OutTKN);

      // get totals Out
      let totalOutETH = uniswapOuts[0] + dydxOutETH + optionOutETH;
      let totalOutTKN = uniswapOuts[1] + dydxOutTKN + option1OutTKN + option2OutTKN;


      let debalanced;
      if (isTokenProfitTakingCurrency) {
        debalanced = debalanceDAI(market, totalInETH, totalOutETH, totalOutTKN);
      } else {
        debalanced = debalanceETH(market, totalInTKN, totalOutETH, totalOutTKN);
      }
       
      //console.log("Debalanced @" + i + ": " + debalanced[0].toFixed(4) + " ETH + " + debalanced[1].toFixed(2) + " DAI");
    
      balanceArrayETH.push({x: i, y: (debalanced[0] / totalInETH * 100)});
      balanceArrayTKN.push({x: i, y: (debalanced[1] / totalInTKN * 100)});

      // find maximums
      if(maxBalanceETH < debalanced[0]) {
        maxBalanceETH = debalanced[0];
        priceForMaxETH = i;
      }
      if(maxBalanceTKN < debalanced[1]) {
        maxBalanceTKN = debalanced[1];
        priceForMaxTKN = i;
      }
    }
    console.log("Max profit in ETH: " + maxBalanceETH + " @" + priceForMaxETH + " TKN");
    console.log("Max profit in TKN: " + maxBalanceTKN + " @" + priceForMaxTKN + " TKN");

    return [balanceArrayETH, balanceArrayTKN];
  }


  getPerformanceChartOptions(props) {
    const performanceOptions = {
      chart: {
        type: 'area'
      },
      title: {
        text: null
      },
      plotOptions: {
        series: {
          stacking: 'normal',
          lineColor: '#666666',
          lineWidth: 1,
          marker: {
              lineWidth: 1,
              lineColor: '#666666'
          }
        }
      },     
      series: [
        { data: this.state.chartData}
      ],
      tooltip: {
        shared: true, // this doesn't work
        valueSuffix: ' USD',
        valueDecimals: 2
      },
      credits: {
        enabled: false
      }
    }

    return performanceOptions;
  }

  render() {
    const tooltipHelpText2 = <Tooltip id="edit_tooltip">
      Portfolio history panel displays a chart of daily historical snapshots of your portfolio. 
      All changes to your portfolio are taken into account: trades, deposits and withdrawals. 
      <br/><br/> 
      Easily zoom in/out with predefined time periods, or use the slider on the bottom to fine tune.
    </Tooltip>; 

    return (
      <Card
        title="How does my position looks like?"
        //category="24 Hours performance"
        rightSection={
          <OverlayTrigger placement="bottom" overlay={tooltipHelpText2}>
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
        }
        content={
          <HighchartsReact
            highcharts={Highcharts}
            //constructorType={'stockChart'}
            options={this.getPerformanceChartOptions(this.props)}
          />
        }
      />
    );
  }
}

export default PositionChartCard;