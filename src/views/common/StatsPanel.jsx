import React, { Component } from "react";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Card from "components/Card/Card.jsx";
import { Grid, Col, Row } from "react-bootstrap";
import { formatUtils } from './../../utils/FormatUtils';
//import { resModel } from "../../model/init/ResModelInit.js";

// TODO remove resModel, use props

class PortfolioPie extends Component {
  constructor(props) {
    super(props);
    this.getTradingProfit = this.getTradingProfit.bind(this);
    this.state = {
      chartOptions: null
    };
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    this.setState({
        chartOptions: null
    });
  }

  getTradingProfit(props) {
    let newestFirst = props.userModel.transactions.slice(0, props.userModel.transactions.length);
    newestFirst.sort((a, b) => b.time.getTime() - a.time.getTime());
    let totalProfit = 0;
    for (let tx of newestFirst) {
      if (tx.isTrade) {
        totalProfit += tx.getProfit(props.resModel, props.resModel.usd);
      }
    }

    return totalProfit;
  }

  getTotal(props, totalBalance) {
    // sum all deposits, and withdrawals on their transaction date
    let newestFirst = props.userModel.transactions.slice(0, props.userModel.transactions.length);
    newestFirst.sort((a, b) => b.time.getTime() - a.time.getTime());
    let totalDeposits = 0, totalWithdrawals = 0;
    for (let tx of newestFirst) {
      if (!tx.isTrade) {
        let lastPrice = props.resModel.getPastPrice(tx.pair.base, props.resModel.usd, tx.time);
        if (tx.isBuy) {
          totalDeposits += tx.baseAmount * lastPrice;
        } else {
          totalWithdrawals += tx.baseAmount * lastPrice;
        }
      }
    }

    // subtract deposits, add withdrawals to final balance 
    return totalBalance - totalDeposits + totalWithdrawals;
  }

  getExposureToCryptoPercentage(props, currentPortfolio, totalBalance) {
    let totalCryptoBalance = currentPortfolio.getTotalCryptoBalance(props.resModel, props.resModel.usd);
    return totalCryptoBalance / totalBalance * 100;
  }

  render() {
    let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
    let totalBalance = currentPortfolio.getTotalBalance(this.props.resModel, this.props.resModel.usd);

    let tradingProfit = this.getTradingProfit(this.props);
    let total = this.getTotal(this.props, totalBalance);
    let capitalAppreciation = total - tradingProfit;
    let tradeCount = this.props.userModel.portfolios.slice(-1)[0].tradeCount;
    let exposureToCrypto = this.getExposureToCryptoPercentage(this.props, currentPortfolio, totalBalance);
    return (
      <Card
        title={this.props.title}
        category='All time'
        content={
          <div>
          <Row>
            <Col md={12}>
              <div className="table-responsive">
                <h5>How do I make profit?</h5>
                <table className="table table-hover">
                  <tbody>
                    <tr>
                      <td>buy and hold</td>
                      <td className="text-right">{formatUtils.toShortFormat(capitalAppreciation)}</td>
                      <td className="text-right">{formatUtils.formatNumber(capitalAppreciation / total * 100, 2)}%</td>
                    </tr>
                    <tr>
                      <td>trade</td>
                      <td className="text-right">{formatUtils.toShortFormat(tradingProfit)}</td>
                      <td className="text-right">{formatUtils.formatNumber(tradingProfit / total * 100, 2)}%</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td className="text-right">{formatUtils.toShortFormat(total)}</td>
                      <td className="text-right">100.00%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <Row>
          <Col md={12}>
            <div className="table-responsive">
              <h5>What are some key insights?</h5>
              <table className="table table-hover">
                <tbody>
                  <tr>
                    <td>Most profitable pair</td>
                    <td className="text-right">ETH/USD</td>
                  </tr>
                  <tr>
                    <td>Withdrawn</td>
                    <td className="text-right">$18.43K</td>
                  </tr>
                  <tr>
                    <td>Exposure to crypto</td>
                    <td className="text-right">{formatUtils.formatNumber(exposureToCrypto, 2)}%</td>
                  </tr>
                  <tr>
                    <td>Average profit per trade</td>
                    <td className="text-right">{formatUtils.toShortFormat(tradingProfit / tradeCount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
        </div>
          }
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
