import React, { Component } from "react";
import {
  Nav,
  NavItem,
} from "react-bootstrap";
import { formatUtils } from './../../utils/FormatUtils';

class HeaderLinks extends Component {

  toShortFormat(balance) {
    let short = balance;
    let adder = "";
    if(balance > 10000000000) {
      short = balance / 1000000000;
      adder = "B";
    } else if(balance > 10000000) {
      short = balance / 1000000;
      adder = "M";
    } else if(balance > 10000) {
      short = balance / 1000;
      adder = "K";
    }

    // special case if portfolio is negative
    if(balance < 0) {
      let value = formatUtils.formatNumber(short, 2) + adder;
      return "-$" + value.slice(1, value.length);
    }

    return "$" + formatUtils.formatNumber(short, 2) + adder;
  }

  getTotalBalance() {
    if(this.props.userModel != null) {
      let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
      return currentPortfolio.getTotalBalance(this.props.resModel, this.props.resModel.usd);
    } 

    return 0;
  }

  // TODO: bigger font

  render() {
    return (
      <div>
        <Nav pullRight>
          <NavItem eventKey={3} href="#/portfolio">
            <p>{this.toShortFormat(this.getTotalBalance())}</p>
          </NavItem>
        </Nav>
      </div>
    );
  }
}
export default HeaderLinks;
