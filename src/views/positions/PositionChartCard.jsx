import React, { Component } from "react";
// react component for creating dynamic tables
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
//import { formatUtils } from '../../utils/FormatUtils';
//import Uniswap from '../../web3/Uniswap';
//import dYdXLong from '../../web3/dYdXLong';
//import dYdXShort from '../../web3/dYdXShort';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { debalanceETH, debalanceDAI } from '../../web3/common.js';

class PositionChartCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartLoaded: false,
      chartData: [Math.random() * 5, 2, 1]
    };
  }

  async componentDidUpdate(prevProps) {
    if (this.userModelLoaded() && this.props.selectedPosition) {
      // call only once
      if(!this.state.chartLoaded || prevProps.selectedPosition !== this.props.selectedPosition) {
        this.refreshChart();
      } 
    }
  }

  userModelLoaded() {
    let userModel = this.props.userModel;
    return userModel && userModel.positions && Array.isArray(userModel.positions);
  }

  refreshChart() {
    console.log("Refreshing chart data. Position: ");
    let pos = this.props.selectedPosition;   
    console.log(pos)
    
    // time 
    let daysSinceStart = (new Date() - new Date(pos.startDate)) / (1000 * 60 * 60 * 24);
    
    let currentPrice = 0;
    let startPrice = 500;
    let endPrice = 3000;	
    let aprsBASE = [], profitsBASE = [], profitsUNDER = [];
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

        if(subpos.type === "uniswap") {
          currentPrice = subpos.service.getPrice();
        }
      }

      // debalance for max BASE
      let debalancedBASE = debalanceDAI(i, startUNDER, 0, totalOutBASE);
      //console.log("debalanced BASE @" + i.toFixed(3) + ": " + debalancedBASE[0].toFixed(4) + " UNDER + " + debalancedBASE[1].toFixed(4) + " BASE");
      let profitBASE = debalancedBASE[1] - startBASE;
      let hodlBASE = startBASE + startUNDER * i;
      let aprTargetBASE = profitBASE / hodlBASE / daysSinceStart * 365 * 100;

      // debalance for max UNDER
      let debalancedUNDER = debalanceETH(i, startBASE, totalOutUNDER, 0);
      //console.log("debalanced UNDER @" + i.toFixed(3) + ": " + debalancedUNDER[0].toFixed(4) + " UNDER + " + debalancedUNDER[1].toFixed(4) + " BASE");
      let profitUNDER = debalancedUNDER[0] - startUNDER;
      //let hodlUNDER = startBASE / i + startUNDER;
      //let aprTargetUNDER = profitUNDER / hodlUNDER / daysSinceStart * 365 * 100;

      aprsBASE.push({x: i, y: aprTargetBASE});
      profitsBASE.push({x: i, y: profitBASE});
      profitsUNDER.push({x: i, y: profitUNDER});
    }

    let rangeEdgesBASE = this.getRangePoints(profitsBASE);
    let rangeEdgesUNDER = this.getRangePoints(profitsUNDER);


    this.setState({
      chartLoaded: true,
      chartData1: aprsBASE,
      chartData2: profitsBASE,
      chartData3: profitsUNDER,
      rangeEdgesBASE: rangeEdgesBASE, 
      rangeEdgesUNDER: rangeEdgesUNDER,
      currentPrice: currentPrice
    });
  }

  getRangePoints(profits) {
    // find maximum profit
    let maxProfit = -100000000000;
    for(let i = 0; i < profits.length; i++) {
      if(maxProfit < profits[i].y) {
        maxProfit = profits[i].y;
      }
    }

    let leftPoint = null, rightPoint = null, prevPoint;
    // find left and right range edge [90%]
    for(let i = 0; i < profits.length; i++) {
      if(leftPoint === null && profits[i].y > maxProfit * 0.9) {
        leftPoint = { x: profits[i].x, y: profits[i].y };
      } 
      
      if(leftPoint !== null && rightPoint === null && profits[i].y < maxProfit * 0.9) {
        rightPoint = prevPoint;
      }

      prevPoint = { x: profits[i].x, y: profits[i].y };
    }

    return [leftPoint, rightPoint]
  }

  getPerformanceChartOptions() {
    const performanceOptions = {
      chart: {
        type: 'line',
        height: '600'
      },
      title: {
        text: 'APR for position: ' + (this.props.selectedPosition != null ? this.props.selectedPosition.name : 'unknown')
      },
      xAxis: {
        plotBands: [
          {
            from: this.state.rangeEdgesUNDER ? this.state.rangeEdgesUNDER[0].x : 0,
            to: this.state.rangeEdgesUNDER ? this.state.rangeEdgesUNDER[1].x : 0,
            color: 'rgba(165, 244, 151, 0.4)',
            label: {
                text: 'Max UNDER Range',
                style: {
                    color: '#606060'
                }
            }
          },
          { 
            from: this.state.rangeEdgesBASE ? this.state.rangeEdgesBASE[0].x : 0,
            to: this.state.rangeEdgesBASE ? this.state.rangeEdgesBASE[1].x : 0,
            color: 'rgba(242, 240, 150, 0.4)',
            label: {
                text: 'Max BASE Range',
                style: {
                    color: '#606060'
                }
            }
          },
          { 
            from: this.state.currentPrice ? this.state.currentPrice * 0.998 : 0,
            to: this.state.currentPrice ? this.state.currentPrice * 1.002 : 0,
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
            options={this.getPerformanceChartOptions()}
          />
        }
      />
    );
  }
}

export default PositionChartCard;