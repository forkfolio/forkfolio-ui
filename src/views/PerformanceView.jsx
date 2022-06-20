import React, { Component } from "react";
import { Grid, Col, Row, Tooltip, OverlayTrigger } from "react-bootstrap";
import Highstock from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import PortfolioPie from './common/PortfolioPie'
import Card from "components/Card/Card.jsx";
import Button from "components/CustomButton/CustomButton.jsx";
import { rangeSelectorModel } from "../model/init/ResModelInit.js";
import ReactGA from 'react-ga';


class PerformanceView extends Component {
  constructor(props) {
    super(props);

    this.rangeClickHandler = this.rangeClickHandler.bind(this);

    let daysSince = props.userModel.getDaysSinceFirstTx();
    let portfolios = this.getBestCurrentWorstPortfolio(props, daysSince);
    this.state = {
      bestPortfolio: portfolios.best,
      currentPortfolio: portfolios.current,
      worstPortfolio: portfolios.worst,
      performanceChartOptions: this.getPerformanceChartOptions(props, portfolios.best, portfolios.current, portfolios.worst)
    };
  }
  
  componentWillMount() {
    rangeSelectorModel.days = this.props.userModel.getDaysSinceFirstTx();;
    rangeSelectorModel.userFriendlyText = "All time";

    console.log("Navigate to: " + window.location.pathname + window.location.hash);
    ReactGA.pageview(window.location.pathname + window.location.hash);
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    let daysSince = nextProps.userModel.getDaysSinceFirstTx();
    let portfolios = this.getBestCurrentWorstPortfolio(nextProps, daysSince); 
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

    // TODO: what's this
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
    const serie = [];
    // take usd tickers as template for dates
    if(props.resModel.dailyTickers.get(props.resModel.usd) != null) {
      for(let t of props.resModel.dailyTickers.get(props.resModel.usd)) {
        let totalPastBalance = portfolio.getPastTotalBalance(props.resModel, t.time, props.resModel.usd);
        serie.push([t.time.getTime(), totalPastBalance]);
      }

      // take the last price and update it with recent price
      if(serie.slice(-1)[0] != null) {     
        serie.slice(-1)[0][1] = portfolio.getTotalBalance(props.resModel, props.resModel.usd)
      }
    }

    return serie;
  }

  getPerformanceChartOptions(props, best, current, worst) {   
    let series = [];
    series.push({name: "Best portfolio", data: this.getPortfolioSeries(props, best)});
    series.push({name: "Current portfolio", data: this.getPortfolioSeries(props, current)});    
    series.push({name: "Worst portfolio", data: this.getPortfolioSeries(props, worst)});

    var externalCaller = this.rangeClickHandler;
    for(let i = 0; i < rangeSelectorModel.buttons.length; i++) {
      rangeSelectorModel.buttons[i].events = {
        click: function() {
          rangeSelectorModel.days = rangeSelectorModel.buttons[i].days;
          rangeSelectorModel.userFriendlyText = rangeSelectorModel.buttons[i].userFriendlyText;
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
    const tooltipHelpText1 = <Tooltip id="edit_tooltip">
      Performance panel displays a chart of best, worst and current portfolio in a selected time period. Click on a zoom buttons to select time period. <br/><br/> 
      Chart is useful to evaluate your trading performance in selected time period. The closer your current is to the best portfolio, the better. <br/><br/> 
      Current portfolio is portfolio with all your trades, portfolio you have right now. <br/><br/> 
      Best/worst portfolio is portfolio with highest/lowest value in USD if you'd stopped trading altogether at some moment in selected time period. 
    </Tooltip>; 

    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="How does my current portfolio compare to past portfolios?"
                category={rangeSelectorModel.userFriendlyText != null ? rangeSelectorModel.userFriendlyText : "All time" }
                rightSection={
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
                }
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
