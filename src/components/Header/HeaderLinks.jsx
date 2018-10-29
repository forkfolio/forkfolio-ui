import React, { Component } from "react";
import {
  Nav,
  NavItem,
} from "react-bootstrap";
import { formatUtils } from './../../utils/FormatUtils';

class HeaderLinks extends Component {



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
            <p>{formatUtils.toShortFormat(this.getTotalBalance())}</p>
          </NavItem>
        </Nav>
      </div>
    );
  }
}
export default HeaderLinks;
