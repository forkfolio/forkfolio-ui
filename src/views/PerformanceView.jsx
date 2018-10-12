import React, { Component } from "react";
import { Grid, Col, Row } from "react-bootstrap";
import Highstock from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import PortfolioPie from './common/PortfolioPie'
import Card from "components/Card/Card.jsx";
import { rangeSelectorModel } from "../model/init/ResModelInit.js";
import ReactGA from 'react-ga';


class PerformanceView extends Component {
  constructor(props) {
    super(props);

    this.rangeClickHandler = this.rangeClickHandler.bind(this);

    let portfolios = this.getBestCurrentWorstPortfolio(props, 90);
    this.state = {
      bestPortfolio: portfolios.best,
      currentPortfolio: portfolios.current,
      worstPortfolio: portfolios.worst,
      performanceChartOptions: this.getPerformanceChartOptions(props, portfolios.best, portfolios.current, portfolios.worst)
    };
  }
  
  componentWillMount() {
    console.log("Navigate to: " + window.location.pathname + window.location.hash);
    ReactGA.pageview(window.location.pathname + window.location.hash);
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps PerformanceView")
    let portfolios = this.getBestCurrentWorstPortfolio(nextProps, 90); // TODO 90 should be from props, move up 
    this.setState({
      bestPortfolio: portfolios.best,
      currentPortfolio: portfolios.current,
      worstPortfolio: portfolios.worst,
      performanceChartOptions: this.getPerformanceChartOptions(nextProps, portfolios.best, portfolios.current, portfolios.worst)
    });
  }

  rangeClickHandler() {
    let portfolios = this.getBestCurrentWorstPortfolio(this.props, rangeSelectorModel.days);
    this.setState({
      bestPortfolio: portfolios.best,
      currentPortfolio: portfolios.current,
      worstPortfolio: portfolios.worst,
      performanceChartOptions: this.getPerformanceChartOptions(this.props, portfolios.best, portfolios.current, portfolios.worst)
    });
  }

  getBestCurrentWorstPortfolio(props, days) {
    // TODO check whats going on when first loaded on performance, chart not showing
    let since = new Date(2018,4,28);
    since.setHours(2,0,0,0);
    //console.log(since)
    if(props.resModel.dailyTickers.get(props.resModel.usd) != null && 
      props.resModel.dailyTickers.get(props.resModel.usd).slice(-days)[0] != null) {
      since = props.resModel.dailyTickers.get(props.resModel.usd).slice(-days)[0].time;
      //console.log(since)
    }
    //console.log(since)
    let portfoliosSince = props.userModel.getPortfoliosSince(since);
    //console.log(portfoliosSince);

    let currentPortfolio = props.userModel.portfolios.slice(-1)[0];
    let bestPortfolio = currentPortfolio, worstPortfolio = currentPortfolio;
    for(let p of portfoliosSince) {
      let totalBalance = p.getTotalBalance(props.resModel, props.resModel.usd);
      // best 
      if(totalBalance >= bestPortfolio.getTotalBalance(props.resModel, props.resModel.usd)) {
        bestPortfolio = p;
      }
      // worst
      if(totalBalance <= worstPortfolio.getTotalBalance(props.resModel, props.resModel.usd)) {
        worstPortfolio = p;
      }
    }

    // TODO: add future fundings here

    return {
      best: bestPortfolio, 
      current: currentPortfolio,
      worst: worstPortfolio
    };
  }

  getPortfolioSeries(props, portfolio) {
    // prepare portfolio performance chart
    const series = [];
    for (const currency of portfolio.balances.keys()) {
      const serie = [];
      for(let t of props.resModel.dailyTickers.get(currency)) {
        let balanceInDenominated = t.price * portfolio.getPastBalance(t.pair.base, t.time);
        serie.push([t.time.getTime(), balanceInDenominated]);
      }
      // take the last price and update it with recent price
      if(serie.slice(-1)[0] != null) {     
        serie.slice(-1)[0][1] = portfolio.getCurrencyBalance(props.resModel, currency, props.resModel.usd)
        series.push({name: currency.code, data: serie});
      }
    }

    // add at the end
    const addedSeries = [];
    for (const obj of series) {
      for(let i = 0; i < obj.data.length; i++) {
        // first add zeros
        if(addedSeries[i] == null) {
          addedSeries.push([obj.data[i][0], 0]);
        }
        
        addedSeries[i][1] += obj.data[i][1];
      }
    }
    return addedSeries;
  }

  getPerformanceChartOptions(props, best, current, worst) {   
    let series = [];
    series.push({name: "Best", data: this.getPortfolioSeries(props, best)});
    series.push({name: "Current", data: this.getPortfolioSeries(props, current)});    
    series.push({name: "Worst", data: this.getPortfolioSeries(props, worst)});
    //console.log(series)
    //console.log(rangeSelectorModel)

    var externalCaller = this.rangeClickHandler;
    for(let i = 0; i < rangeSelectorModel.buttons.length; i++) {
      rangeSelectorModel.buttons[i].events = {
        click: function() {
          rangeSelectorModel.days = rangeSelectorModel.buttons[i].days;
          externalCaller.call();
        }
      }
    }

    const performanceOptions = {
      title: {
        text: null
      },
      rangeSelector: rangeSelectorModel,
      series: series, 
      tooltip: {
        shared: true, // this doesn't work
        valueSuffix: ' USD',
        valueDecimals: 2
      },
      credits: {
        enabled: false
      },
    }

    return performanceOptions;
  }

  render() {
    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="How does my current portfolio compare to past portfolios?"
                //category="24 Hours performance"
                content={<HighchartsReact
                  highcharts={Highstock}
                  constructorType={'stockChart'}
                  options={this.state.performanceChartOptions}
                />}
                /*stats={
                  <div>
                    <i className="fa fa-history" /> Updated 3 minutes ago
                  </div>
                }*/
              />
            </Col>
          </Row>
          <Row>
            <Col md={4}>
            <PortfolioPie
                title="Best portfolio"
                portfolio={this.state.bestPortfolio}
                resModel={this.props.resModel}
              />
            </Col>
            <Col md={4}>
              <PortfolioPie
                title="Current portfolio"
                portfolio={this.state.currentPortfolio}
                resModel={this.props.resModel}
              />
            </Col>
            <Col md={4}>
              <PortfolioPie
                title="Worst portfolio"
                portfolio={this.state.worstPortfolio}
                resModel={this.props.resModel}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default PerformanceView;
