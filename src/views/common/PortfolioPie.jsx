import React, { Component } from "react";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Card from "components/Card/Card.jsx";

class PortfolioPie extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartOptions: this.getPieOptions(props)
    };
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    this.setState({
        chartOptions: this.getPieOptions(nextProps)
    });
  }

  getPieOptions(props) {
    let currentPortfolio = props.portfolio;

    // prepare portfolio pie chart
    const data = [];
    for (let currency of currentPortfolio.balances.keys()) {
      let currencyBalance = currentPortfolio.getCurrencyBalance(props.resModel, currency, props.resModel.usd);
      data.push({name: currency.code, y: currencyBalance});
    }

    const pieOptions = {
      chart: {
        type: "pie",
      },
      title: {
        text: null
      },
      series: [{
        name: "Allocation",
        data: data
      }],
      tooltip: {
        shared: true, // this doesn't work
        valueSuffix: ' USD',
        valueDecimals: 2
      },
      credits: {
        enabled: false
      }
    }

    return pieOptions;
  }
   render() {
     let tradeCount = this.props.portfolio.tradeCount;
    return (
      <Card
        title={this.props.title}
        category={tradeCount + " trade" + (tradeCount === 1 ? "" : "s")}
        content={<HighchartsReact
          highcharts={Highcharts}
          options={this.state.chartOptions}
        />}
        /*stats={
          <div>
            <i className="fa fa-clock-o" /> Campaign sent 2 days ago
          </div>
        }*/
      />          
    );
  }
}

export default PortfolioPie;
