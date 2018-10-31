import React, { Component } from "react";
import Card from "components/Card/Card.jsx";
import { Col, Row } from "react-bootstrap";
import { formatUtils } from '../../utils/FormatUtils';

class InsightsCard extends Component {
  constructor(props) {
    super(props);
    this.getTradingProfit = this.getTradingProfit.bind(this);
  }

  getTradingProfit(props) {
    let totalProfit = 0;
    for (let tx of props.userModel.transactions) {
      if (tx.isTrade) {
        totalProfit += tx.getProfit(props.resModel, props.resModel.usd);
      }
    }

    return totalProfit;
  }

  getTotalFundings(props) {
    // sum all deposits, and withdrawals on their transaction date
    let totalDeposits = 0, totalWithdrawals = 0;
    for (let tx of props.userModel.transactions) {
      if (!tx.isTrade) {
        let lastPrice = props.resModel.getPastPrice(tx.pair.base, props.resModel.usd, tx.time);
        if (tx.isBuy) {
          totalDeposits += tx.baseAmount * lastPrice;
        } else {
          totalWithdrawals += tx.baseAmount * lastPrice;
        }
      }
    }

    return {
      totalDeposits: totalDeposits,
      totalWithdrawals: totalWithdrawals
    }
  }

  getExposureToCryptoPercentage(props, currentPortfolio, totalBalance) {
    let totalCryptoBalance = currentPortfolio.getTotalCryptoBalance(props.resModel, props.resModel.usd);
    return totalCryptoBalance / totalBalance * 100;
  }

  toShortFormatStyled(value) {
    let style1 = "font-" + (value >= 0 ? "green" : "red" );
    return (
      <div className={style1}>
        {formatUtils.toShortFormat(value)}
      </div>
    );
  }

  toDecimalFormatStyled(value, addon) {
    let style1 = "font-" + (value >= 0 ? "green" : "red" );
    return (
      <div className={style1}>
        {formatUtils.formatNumber(value, 2) + addon}
      </div>
    );
  }

  render() {
    let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
    let totalBalance = currentPortfolio.getTotalBalance(this.props.resModel, this.props.resModel.usd);
    let tradingProfit = this.getTradingProfit(this.props);
    let fundings = this.getTotalFundings(this.props);
    let totalProfit = totalBalance - fundings.totalDeposits + fundings.totalWithdrawals;
    let holdingProfit = totalProfit - tradingProfit;
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
                      <td>by holding</td>
                      <td className="text-right">{this.toDecimalFormatStyled(holdingProfit / totalProfit * 100, '%')}</td>
                      <td className="text-right">{this.toShortFormatStyled(holdingProfit)}</td>
                    </tr>
                    <tr>
                      <td>by trading</td>
                      <td className="text-right">{this.toDecimalFormatStyled(tradingProfit / totalProfit * 100, '%')}</td>
                      <td className="text-right">{this.toShortFormatStyled(tradingProfit)}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td className="text-right">{this.toShortFormatStyled(totalProfit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <Row>
          <Col md={12}>
            <div className="table-responsive">
              <h5>What are my key insights?</h5>
              <table className="table table-hover">
                <tbody>
                  <tr>
                    <td>Average profit per trade</td>
                    <td className="text-right">{this.toShortFormatStyled(tradingProfit / tradeCount)}</td>
                  </tr>
                  {/*<tr>
                    <td>Most profitable pair</td>
                    <td className="text-right">ETH/USD</td>
                  </tr>*/}
                  <tr>
                    <td>Withdrawn</td>
                    <td className="text-right">{formatUtils.toShortFormat(fundings.totalWithdrawals)}</td>
                  </tr>
                  <tr>
                    <td>Exposure to crypto</td>
                    <td className="text-right">{formatUtils.formatNumber(exposureToCrypto, 2)}%</td>
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

export default InsightsCard;
