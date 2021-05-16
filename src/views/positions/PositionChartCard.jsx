import React, { Component } from "react";
// react component for creating dynamic tables
import { 
  Tooltip, 
  OverlayTrigger,
  Grid,
  Row,
  Col,
  FormControl
 } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import SubpositionCard from "./SubpositionCard.jsx";
import AddSubpositionCard from "./AddSubpositionCard.jsx";
import UniswapV2Card from "./subpositions/UniswapV2Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { debalanceETH, debalanceDAI, clone } from '../../web3/common.js';

class PositionChartCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartLoaded: false,
      chartData: [Math.random() * 5, 2, 1],
      customMin: 100,
      customMax: 3000
    };

    this.updateSubposition = this.updateSubposition.bind(this);
  }

  async componentDidUpdate(prevProps, prevState) {
    
    if (this.userModelLoaded() && this.props.selectedPosition) {
      // set customPosition if there is a change in props
      if(prevProps.selectedPosition !== this.props.selectedPosition) {
        console.log("setting customPosition")
        this.setState({
          customPosition: clone(this.props.selectedPosition)
        });
      } else {
        // refresh chart if customPosition is updated
        if(prevState.customPosition !== this.state.customPosition) {
          console.log("refreshing chart")
          this.refreshChart();
        }
      }
    }
  }

  userModelLoaded() {
    let userModel = this.props.userModel;
    return userModel && userModel.positions && Array.isArray(userModel.positions);
  }

  refreshChart() {
    console.log("Refreshing chart data. Position: ");
    let pos = this.state.customPosition;   
    console.log(pos)
    
    // time 
    let daysSinceStart = (new Date() - new Date(pos.startDate)) / (1000 * 60 * 60 * 24);
    
    let chartWindow = this.getChartWindow(pos);
    let currentPrice = 0;
    let startPrice = chartWindow.step * 25;
    let endPrice = chartWindow.right;	
    let step = chartWindow.step;	
    let aprsBASE = [], profitsBASE = [], profitsUNDER = [];
    for(let i = startPrice; i < endPrice; i += step) {
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
      currentPrice: currentPrice,
      customMin: chartWindow.left,
      customMax: chartWindow.right
    });
  }

  /**
   * Returns start, end prices for chart.
   *
   * @param {object}   pos       Position.
   * @return {type} Return value description.
   */
  getChartWindow(pos) {
    let pivot = pos.entryPrice;
    let step;
    if(pivot < 1) {
      step = 0.001;
    } else if(pivot < 10) {
      step = 0.01;
    } else if(pivot < 100) {
      step = 0.1;
    } else if(pivot < 1000) {
      step = 1;
    } else if(pivot < 10000) {
      step = 10;
    } else if(pivot < 100000) {
      step = 100;
    }

    return {
      left: Number(pivot / 3),
      right: Number(pivot * 4),
      step: step
    }
  }

  /**
   * Returns points for range ploting (90%).
   *
   * @param {Array}   profits       Profit points on chart.
   * @return {type} Return value description.
   */
  getRangePoints(profits) {
    // find maximum profit
    let maxProfit = -100000000000;
    for(let i = 0; i < profits.length; i++) {
      if(maxProfit < profits[i].y) {
        maxProfit = profits[i].y;
      }
    }

    console.log("maxProfit: " + maxProfit)

    let firstPoint = { x: profits[0].x, y: profits[0].y };
    let leftPoint = firstPoint; 
    let rightPoint = null, prevPoint;
    // find left and right range edge [90%]
    for(let i = 0; i < profits.length; i++) {
      if(leftPoint === firstPoint && profits[i].y >= maxProfit * 0.9) {
        leftPoint = { x: profits[i].x, y: profits[i].y };
      } 
      
      if(leftPoint !== firstPoint && rightPoint === null && profits[i].y < maxProfit * 0.9) {
        rightPoint = prevPoint;
      }

      prevPoint = { x: profits[i].x, y: profits[i].y };
    }

    if(rightPoint === null) {
      rightPoint = prevPoint;
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
        text: 'APR for position: ' + (this.state.customPosition != null ? this.state.customPosition.name : 'unknown')
      },
      xAxis: {
        min: this.state.customMin,
        max: this.state.customMax,
        plotLines: [{
          color: '#3D3D3D',
          width: 2,
          value: this.state.currentPrice ? this.state.currentPrice : 0,
          label: {
            text: "Current price"
          }
        }],
        plotBands: [
          {
            from: this.state.rangeEdgesUNDER ? this.state.rangeEdgesUNDER[0].x : 0,
            to: this.state.rangeEdgesUNDER ? this.state.rangeEdgesUNDER[1].x : 0,
            color: 'rgba(165, 244, 151, 0.4)',
            label: {
                text: '90% UNDER',
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
                text: '90% BASE',
                style: {
                    color: '#606060'
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
          min: -100,
          plotBands: [
            {
              from: 0,
              to: -10000000000,
              color: 'rgba(255, 33, 33, 0.06)',
              label: {
                  text: 'Red Zone',
              }
            }
          ]
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
      series: [
        { 
          name: "APR [%] (BASE or UNDER)", 
          data: this.state.chartData1,
          tooltip: {
            valueSuffix: '%'
          },
          turboThreshold: 10000
        },
        { 
          name: "Profit [BASE]", 
          data: this.state.chartData2,
          yAxis: 1,
          visible: false,
          tooltip: {
            valueSuffix: ' BASE' // todo
          },
          turboThreshold: 10000
        },
        { 
          name: "Profit [UNDER]", 
          data: this.state.chartData3,
          yAxis: 2,
          visible: false,
          tooltip: {
            valueSuffix: ' UNDER' // todo
          },
          turboThreshold: 10000
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

  updateSubposition(index, subpos) {
    console.log("updateSubposition called")
    console.log(this.state)
    let updatedPosition = clone(this.state.customPosition);
    updatedPosition.subpositions[index] = subpos;
    this.setState({
      customPosition: updatedPosition
    });
  }

  getSubpositionCards() {
    if(this.state.customPosition) {
      return (
        <div>
        <Col md={4}>
          <UniswapV2Card
            index={0}
            subposition={this.state.customPosition.subpositions[0]}
            resModel={this.props.resModel}
            userModel={this.props.userModel}
            updateSubposition={this.updateSubposition}
          />
        </Col>
        <Col md={4}>
          <SubpositionCard
            id={1}
            portfolio={this.props.userModel.portfolios.slice(-1)[0]}
            resModel={this.props.resModel}
            userModel={this.props.userModel}
          />
        </Col>
        <Col md={4}>
          <SubpositionCard
            id={2}
            portfolio={this.props.userModel.portfolios.slice(-1)[0]}
            resModel={this.props.resModel}
            userModel={this.props.userModel}
          />
        </Col>
        <Col md={4}>
          <SubpositionCard
            id={3}
            portfolio={this.props.userModel.portfolios.slice(-1)[0]}
            resModel={this.props.resModel}
            userModel={this.props.userModel}
          />
        </Col>
        <Col md={4}>
          <AddSubpositionCard
            portfolio={this.props.userModel.portfolios.slice(-1)[0]}
            resModel={this.props.resModel}
            userModel={this.props.userModel}
          />
        </Col>
        </div>
      )
    }

    return null;
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
          <div className="main-content">
          <Grid fluid>
            <Row>
              <Col md={12}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={this.getPerformanceChartOptions()}
                />
              </Col>
            </Row>
            <Row>
              <Col md={1}>
                Min X:
              </Col>
              <Col md={2}>
                <FormControl
                  placeholder={"Min X"}
                  type="number"
                  name="customMin"
                  min={0}
                  value={this.state.customMin}
                  onChange={event => {
                    this.setState({
                      customMin: Number(event.target.value)
                    });
                  }}
                />
              </Col>
              <Col md={3}>
              </Col>
              <Col md={1}>
                Max X:
              </Col>
              <Col md={2}>
                <FormControl
                  placeholder={"Max X"}
                  type="number"
                  name="customMax"
                  min={0}
                  value={this.state.customMax}
                  onChange={event => {
                    this.setState({
                      customMax: Number(event.target.value)
                    });
                  }}
                />
              </Col>
              <Col md={3}>
              </Col>
              {this.getSubpositionCards()}
            </Row>
          </Grid>
        </div>
        }
      />
    );
  }
}

export default PositionChartCard;