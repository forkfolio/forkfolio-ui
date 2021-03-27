import React, { Component } from "react";
// react component for creating dynamic tables
import { Grid, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import { formatUtils } from '../../utils/FormatUtils';
import Uniswap from '../../web3/Uniswap';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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
    if (this.props.userModel && 
      this.props.userModel.positions && 
      Array.isArray(this.props.userModel.positions) && 
      !this.state.chartLoaded && 
      this.props.markets) {
      console.log("Refreshing chart data")
      // call only once (using chartLoaded)
      this.setState({
        chartLoaded: true,
        chartData: [1, 2, 1]
      });
    }
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