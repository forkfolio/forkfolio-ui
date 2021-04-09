import React, { Component } from "react";
// react component for creating dynamic tables
import { Grid, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import { formatUtils } from '../../utils/FormatUtils';
import Uniswap from '../../web3/Uniswap';
import dYdXLong from '../../web3/dYdXLong';
import dYdXShort from '../../web3/dYdXShort';
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

  async componentDidUpdate() {
    if (this.userModelLoaded() && this.props.selectedPosition) {
      // call only once
      if(!this.state.chartLoaded) {
        console.log("Refreshing chart data");
        // for simulations for now, prepare data here
        let datasets = this.prepareChartData(this.props.selectedPosition);
        console.log(datasets)
      
        this.setState({
          chartLoaded: true,
          chartData1: datasets[0],
          chartData2: datasets[1],
          chartData3: datasets[2]
        });
      }
    }
  }

  userModelLoaded() {
    let userModel = this.props.userModel;
    return userModel && userModel.positions && Array.isArray(userModel.positions);
  }

  prepareChartData(pos) {
    // time 
    let daysSinceStart = (new Date() - new Date(pos.startDate)) / (1000 * 60 * 60 * 24);
    
    let startPrice = 500;
    let endPrice = 3000;	
    let maxPrice = startPrice;
    let maxTotalOutBASE = -100000000000;
    let balancePercentagesBASE = [], balancePercentagesUNDER = [], profitsBASE = [], profitsUNDER = [];
    for(let i = startPrice; i < endPrice; i += 10) {
      let totalOutBASE = 0, totalOutUNDER = 0, startBASE = 0, startUNDER = 0;
      // get totals out
      for(let j = 0; j < pos.subpositions.length; j++) {
        let subpos = pos.subpositions[j];

        // get ins
        startBASE += subpos.base.start;
        startUNDER += subpos.under.start;

        // get outs
        let extraBASE = subpos.base.extra + subpos.under.extra * i;
        totalOutBASE += subpos.service.getCurrentValue(i)[0] + extraBASE;

        let extraUNDER = subpos.base.extra / i + subpos.under.extra;
        totalOutUNDER += subpos.service.getCurrentValue(i)[1] + extraUNDER;
      }

      // debalance for max BASE
      let debalancedBASE = debalanceDAI(i, startUNDER, 0, totalOutBASE);
      console.log("debalanced BASE @" + i.toFixed(3) + ": " + debalancedBASE[0].toFixed(4) + " UNDER + " + debalancedBASE[1].toFixed(4) + " BASE");
      let profitBASE = debalancedBASE[1] - startBASE;
      let hodlBASE = startBASE + startUNDER * i;
      let aprTargetBASE = profitBASE / hodlBASE / daysSinceStart * 365 * 100;

      // debalance for max UNDER
      let debalancedUNDER = debalanceETH(i, startBASE, totalOutUNDER, 0);
      console.log("debalanced UNDER @" + i.toFixed(3) + ": " + debalancedUNDER[0].toFixed(4) + " UNDER + " + debalancedUNDER[1].toFixed(4) + " BASE");
      let profitUNDER = debalancedUNDER[0] - startUNDER;
      let hodlUNDER = startBASE / i + startUNDER;
      let aprTargetUNDER = profitUNDER / hodlUNDER / daysSinceStart * 365 * 100;

      //balanceArrayETH.push({x: i, y: (totalOutBASE / totalInUNDER * 100)});
      //balancePercentagesBASE.push({x: i, y: (debalanced[1] / startBASE * 100)});
      balancePercentagesBASE.push({x: i, y: aprTargetBASE});
      balancePercentagesUNDER.push({x: i, y: aprTargetUNDER});
      profitsBASE.push({x: i, y: profitBASE});
      profitsUNDER.push({x: i, y: profitUNDER});

      // find maximums
      if(maxTotalOutBASE < totalOutBASE) {
        maxTotalOutBASE = totalOutBASE;
        maxPrice = i;
      }
    }
    //console.log("Max profit in ETH: " + maxBalanceETH + " @" + priceForMaxETH + " TKN");
    //console.log("Max balance BASE: " + maxTotalOutBASE + " @" + maxPrice + " BASE");

    return [balancePercentagesBASE, profitsBASE, profitsUNDER];

  }

  getPerformanceChartOptions(props) {
    console.log(props)
    console.log(props.selectedPosition != null ? props.selectedPosition.name : "unknown")
    const performanceOptions = {
      chart: {
        type: 'line',
        height: '600'
      },
      title: {
        text: 'APR for position: ' + (props.selectedPosition != null ? props.selectedPosition.name : 'unknown')
      },
      xAxis: {
        plotBands: [
          {
            from: 900,
            to: 1100,
            color: 'rgba(165, 244, 151, 0.4)',
            label: {
                text: 'Max UNDER Range',
                style: {
                    color: '#606060'
                }
            }
          },
          { 
            from: 1200,
            to: 1500,
            color: 'rgba(242, 240, 150, 0.4)',
            label: {
                text: 'Max BASE Range',
                style: {
                    color: '#606060'
                }
            }
          },
          { 
            from: 2050,
            to: 2060,
            color: 'rgba(27, 27, 27, 0.8)',
            label: {
                text: 'ETH Price',
                style: {
                    color: '#606060',
                    textalign: 'right'
                }
            }
          }
        ]
      },
      yAxis: [
        {
          title: {
            text: 'APR [%]'
          },
          min: 0
        },
        {
          title: {
            text: 'Profit [BASE]'
          },
          opposite: true
        },
        {
          title: {
            text: 'Profit [UNDER]'
          },
          opposite: true
        }
      ],
      /*plotOptions: {
        series: {
          stacking: 'normal',
          lineColor: '#666666',
          lineWidth: 1,
          marker: {
              lineWidth: 1,
              lineColor: '#666666'
          }
        }
      },   */  
      series: [
        { 
          name: "APR [%] (BASE or UNDER)", 
          data: this.state.chartData1,
          tooltip: {
            valueSuffix: '%'
          }
        },
        { 
          name: "Profit [BASE]", 
          data: this.state.chartData2,
          yAxis: 1,
          visible: false,
          tooltip: {
            valueSuffix: 'BASE' // todo
          }
        },
        { 
          name: "Profit [UNDER]", 
          data: this.state.chartData3,
          yAxis: 2,
          visible: false,
          tooltip: {
            valueSuffix: 'UNDER' // todo
          }
        }
      ],
      tooltip: {
        shared: true, // this doesn't work
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