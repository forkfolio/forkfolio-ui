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
import AddSubpositionCard from "./AddSubpositionCard.jsx";
import UniswapV2Card from "./subpositions/UniswapV2Card.jsx";
import UniswapV3Card from "./subpositions/UniswapV3Card.jsx";
import DYDXLongCard from "./subpositions/DYDXLongCard.jsx";
import DYDXShortCard from "./subpositions/DYDXShortCard.jsx";
import GammaOptionsCard from "./subpositions/GammaOptionsCard.jsx";
import SqueethCard from "./subpositions/SqueethCard.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { debalanceETH, debalanceDAI, clone } from '../../web3/common.js';
import { CoinGeckoPrices } from '../../web3/CoinGeckoPrices.js';

class PositionChartCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartLoaded: false,
      chartData: [Math.random() * 5, 2, 1],
      customMinX: 100,
      customMaxX: 3000,
      customXUserSet: false,
      customMinY: undefined,
      customMaxY: undefined,
      currentPrice: 0
    };

    this.addSubposition = this.addSubposition.bind(this);
    this.updateSubposition = this.updateSubposition.bind(this);
    this.removeSubposition = this.removeSubposition.bind(this);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.userModelLoaded() && this.props.selectedPosition) {
      // set customPosition if there is a change in props
      if(prevProps.selectedPosition !== this.props.selectedPosition) {
        let customPosition = clone(this.props.selectedPosition);
        // add enabled flag
        for(let j = 0; j < customPosition.subpositions.length; j++) {
          customPosition.subpositions[j].enabled = true;
        }
        this.setState({
          customPosition: customPosition
        });
      } else {
        // refresh chart if customPosition is updated
        if(prevState.customPosition !== this.state.customPosition) {
          await this.refreshChart();
        }
      }
    }
  }

  userModelLoaded() {
    let userModel = this.props.userModel;
    return userModel && userModel.positions && Array.isArray(userModel.positions);
  }

  async refreshChart() {
    console.log("Refreshing chart data. Position: ");
    let pos = this.state.customPosition;   
    console.log(pos)

    // chart data on today
    let todayData = await this.prepareChartData(pos, 0);

    // chart data in 30 days
    let futureData = await this.prepareChartData(pos, 30);

    this.setState({
      chartLoaded: true,
      chartData1: todayData.aprsBASE,
      chartData2: todayData.profitsBASE,
      chartData3: todayData.profitsUNDER,
      chartData4: futureData.profitsBASE,
      rangeEdgesBASE: todayData.rangeEdgesBASE, 
      rangeEdgesUNDER: todayData.rangeEdgesUNDER,
      currentPrice: todayData.currentPrice,
      customMinX: this.state.customXUserSet ? this.state.customMinX : todayData.customMinX,
      customMaxX: this.state.customXUserSet ? this.state.customMaxX : todayData.customMaxX
    });

  }  

  async prepareChartData(pos, passedDays) { 
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

        if(subpos.enabled) {
          // get ins
          startBASE += subpos.base.start;
          startUNDER += subpos.under.start;

          // get outs
          let extraBASE = subpos.base.extra + subpos.under.extra * i;
          totalOutBASE += subpos.service.getCurrentValue(i, passedDays)[0] + extraBASE;

          let extraUNDER = subpos.base.extra / i + subpos.under.extra;
          totalOutUNDER += subpos.service.getCurrentValue(i, passedDays)[1] + extraUNDER;
        }

        if(currentPrice === 0) {
          if(subpos.type === "uniswap") {
            currentPrice = subpos.service.getPrice();
          } else {
            // todo: used here and in PositionsView, move somewhere
            let market = {
              priceBASEUSD: await CoinGeckoPrices.getTokenPriceInUSD(pos.base.address),
              priceUNDERUSD: await CoinGeckoPrices.getTokenPriceInUSD(pos.under.address)
            }
            currentPrice = market.priceUNDERUSD / market.priceBASEUSD;
          }
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

    return {
      aprsBASE: aprsBASE,
      profitsBASE: profitsBASE,
      profitsUNDER: profitsUNDER,
      rangeEdgesBASE: rangeEdgesBASE, 
      rangeEdgesUNDER: rangeEdgesUNDER,
      currentPrice: currentPrice,
      customMinX: chartWindow.left,
      customMaxX: chartWindow.right
    }
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
      right: 10000,//Number(pivot * 5),
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

    //console.log("maxProfit: " + maxProfit)

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
        text: 'Position: ' + (this.state.customPosition != null ? this.state.customPosition.name : 'unknown')
      },
      xAxis: {
        min: this.state.customMinX,
        max: this.state.customMaxX,
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
          opposite: true,
          min: this.state.customMinY,
          max: this.state.customMaxY,
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
          name: "Profit Today [BASE]", 
          data: this.state.chartData2, 
          yAxis: 1,
          tooltip: {
            valueSuffix: ' BASE' // todo
          },
          turboThreshold: 10000,
        },
        /*{ 
          name: "Profit [UNDER]", 
          data: this.state.chartData3,
          yAxis: 2,
          tooltip: {
            valueSuffix: ' UNDER' // todo
          },
          turboThreshold: 10000
        },*/
        { 
          name: "Profit Future [BASE]", 
          data: this.state.chartData4, 
          yAxis: 1,
          tooltip: {
            valueSuffix: ' BASE' // todo
          },
          turboThreshold: 10000,
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

  async addSubposition(type) {
    let newSubpos;
    if(type === 'uniswap') {
      newSubpos = {
        type: type,
        marketAddress: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
        base: {
          start: 1800,
          extra: 0
        },
        under: {
          start: 1,
          extra: 0
        },
        liq: {
          start: 30.67,
          extra: 0
        },
        apr: 20
      }
    } else if(type === 'uniswapv3') {
      newSubpos = {
        type: type,
        marketAddress: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
        openingPrice: this.state.currentPrice,
        base: {
          start: 1000,
          extra: 0
        },
        under: {
          start: 0,
          extra: 0
        },
        minPrice: 3900 * 0.8, 
        maxPrice: 3900 * 1.2, 
        feeInPercent: 0.3
      }
    } else if(type === 'dydx-long') {
      newSubpos = {
        type: "dydx-long",
        base: {
          start: 0,
          extra: 0
        },
        under: {
          start: 1,
          extra: 0
        },
        quantity: 1, 
        borrowedBASE: 2700, 
        boughtUNDER: 1, 
        openingPrice: 2700
      }
    } else if(type === 'dydx-short') {
      newSubpos = {
        type: "dydx-short",
        base: {
          start: 2700,
          extra: 0
        },
        under: {
          start: 0,
          extra: 0
        },
        quantity: 1, 
        borrowedUNDER: 1,
        boughtBASE: 2700,
        openingPrice: 2700
      }
    } else if(type === 'option') {
      newSubpos = {
        type: type,
        base: {
          start: 183,
          extra: 0
        },
        under: {
          start: 0,
          extra: 0
        },
        isCall: true, 
        isLong: true, 
        quantity: 1, 
        strike: 3200,
        daysToExpiry: 30,
        iv: 86
      }
    } else if(type === 'squeeth') {
      newSubpos = {
        type: "squeeth",
        base: {
          start: 0,
          extra: 0
        },
        under: {
          start: 0,
          extra: 0
        },
        quantity: 0.001, 
        isLong: true, 
        apr: 120,
        openingPrice: 2700
      }
    }
    await this.props.addService(this.state.customPosition, newSubpos);
    let updatedPosition = clone(this.state.customPosition);
    newSubpos.enabled = true;
    updatedPosition.subpositions.push(newSubpos);
    this.setState({
      customPosition: updatedPosition
    });
  }

  updateSubposition(index, subpos) {
    let updatedPosition = clone(this.state.customPosition);
    updatedPosition.subpositions[index] = subpos;
    subpos.service.update(subpos, this.state.currentPrice);
    console.log(updatedPosition)
    this.setState({
      customPosition: updatedPosition
    });
  }

  removeSubposition(index) {
    let updatedPosition = clone(this.state.customPosition);
    updatedPosition.subpositions.splice(index, 1);
    this.setState({
      customPosition: updatedPosition
    });
  }

  displayCard(subpos, index) {

    if(subpos.type === 'uniswap') {
      return (
        <UniswapV2Card
          index={index}
          subposition={subpos}
          updateSubposition={this.updateSubposition}
          removeSubposition={this.removeSubposition}
        />
      );
    } else if(subpos.type === 'uniswapv3') {
      return (
        <UniswapV3Card
          index={index}
          subposition={subpos}
          updateSubposition={this.updateSubposition}
          removeSubposition={this.removeSubposition}
        />
      );
    } else if(subpos.type === 'dydx-long') {
      return (
        <DYDXLongCard
          index={index}
          subposition={subpos}
          updateSubposition={this.updateSubposition}
          removeSubposition={this.removeSubposition}
        />
      );
    } else if(subpos.type === 'dydx-short') {
      return (
        <DYDXShortCard
          index={index}
          subposition={subpos}
          updateSubposition={this.updateSubposition}
          removeSubposition={this.removeSubposition}
        />
      );
    } else if(subpos.type === 'option') {
      return (
        <GammaOptionsCard
          index={index}
          subposition={subpos}
          updateSubposition={this.updateSubposition}
          removeSubposition={this.removeSubposition}
        />
      );
    } else if(subpos.type === 'squeeth') {
      return (
        <SqueethCard
          index={index}
          subposition={subpos}
          updateSubposition={this.updateSubposition}
          removeSubposition={this.removeSubposition}
        />
      );
    } 
  }

  getSubpositionCards() {
    if(this.state.customPosition) {
      return this.state.customPosition.subpositions.map((subpos, index) => {
        return (
          <Col md={4} key={index}>
            {this.displayCard(subpos, index)}
          </Col>
        )
      });
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
              <Col md={2}>
                Price:
              </Col>
              <Col md={2}>
                <FormControl
                  placeholder={"Min X"}
                  type="number"
                  name="customMinX"
                  min={0}
                  value={this.state.customMinX}
                  onChange={event => {
                    this.setState({
                      customMinX: Number(event.target.value),
                      customXUserSet: true
                    });
                  }}
                />
                {' '}
              </Col>
              <Col md={2}>
                <FormControl
                  placeholder={"Max X"}
                  type="number"
                  name="customMaxX"
                  min={0}
                  value={this.state.customMaxX}
                  onChange={event => {
                    this.setState({
                      customMaxX: Number(event.target.value),
                      customXUserSet: true
                    });
                  }}
                />
              </Col>
              <Col md={2}>
                Profit [BASE]:
              </Col>
              <Col md={2}>
                <FormControl
                  placeholder={"Min Y"}
                  type="number"
                  name="customMinY"
                  value={this.state.customMinY}
                  onChange={event => {
                    this.setState({
                      customMinY: Number(event.target.value)
                    });
                  }}
                />
                &nbsp;
              </Col>
              <Col md={2}>
                <FormControl
                  placeholder={"Max Y"}
                  type="number"
                  name="customMaxY"
                  value={this.state.customMaxY}
                  onChange={event => {
                    this.setState({
                      customMaxY: Number(event.target.value)
                    });
                  }}
                />
              </Col>
             </Row>
            <Row>
              {this.getSubpositionCards()}
              <Col md={4}>
                <AddSubpositionCard
                  types={['uniswap','uniswapv3', 'dydx-long', 'dydx-short', 'option', 'squeeth']}
                  addSubposition={this.addSubposition}
                />
              </Col>
            </Row>
          </Grid>
        </div>
        }
      />
    );
  }
}

export default PositionChartCard;