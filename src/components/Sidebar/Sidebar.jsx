import React, { Component } from "react";
import { Collapse } from "react-bootstrap";
import { NavLink } from "react-router-dom";
// this is used to create scrollbars on windows devices like the ones from apple devices
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// backgroundImage for Sidebar
import image from "assets/img/full-screen-image-3.jpg";
import dashboardRoutes from "routes/dashboard.jsx";
//import InputFiles from 'react-input-files';
import InputFiles from './../Input/InputFiles.js'

//const bgImage = { backgroundImage: "url(" + image + ")" };

var ps;

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.onOpenClick = this.onOpenClick.bind(this);
    this.state = {
      isWindows: navigator.platform.indexOf("Win") > -1 ? true : false,
      width: window.innerWidth
    };
  }
  // verifies if routeName is the one active (in browser input)
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  }
  // if the windows width changes CSS has to make some changes
  // this functions tell react what width is the window
  updateDimensions() {
    this.setState({ width: window.innerWidth });
  }
  componentDidMount() {
    this.updateDimensions();
    // add event listener for windows resize
    window.addEventListener("resize", this.updateDimensions.bind(this));
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.refs.sidebarWrapper, {
        suppressScrollX: true,
        suppressScrollY: false
      });
    }
  }
  componentDidUpdate() {
    if (navigator.platform.indexOf("Win") > -1) {
      setTimeout(() => {
        ps.update();
      }, 350);
    }
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
    }
  }

  onOpenClick() {
    document.getElementById('input-files').click();     
    return false;
  }

  getChangeCount() {
    return this.props.changeCount > 0 ? " (" + this.props.changeCount + ")" : "";
  }

  render() {
    return (
      <div className="sidebar" data-color="black" data-image={image}>
        {/*<div className="sidebar-background" style={bgImage} />*/}
        <div className="logo">
          <a
            href="https://forkfol.io/app/"
            className="simple-text logo-mini"
          >
            <div className="logo-img">
              <i className="fa fa-book"></i>
            </div>
          </a>
          <a
            href="https://forkfol.io/app/"
            className="simple-text logo-normal"
          >
            ForkFolio
          </a>
        </div>
        <div className="sidebar-wrapper" ref="sidebarWrapper">
          <ul className="nav">
            {/* If we are on responsive, we want both links from navbar and sidebar
                            to appear in sidebar, so we render here HeaderLinks */}
            {/*this.state.width <= 992 ? <HeaderLinks {...this.props} /> : null*/}
            {/*
                            here we render the links in the sidebar
                            if the link is simple, we make a simple link, if not,
                            we have to create a collapsible group,
                            with the speciffic parent button and with it's children which are the links
                        */}
            {dashboardRoutes.map((prop, key) => {
              var st = {};
              st[prop["state"]] = !this.state[prop.state];
              if (prop.collapse) {
                return (
                  <li className={this.activeRoute(prop.path)} key={key}>
                    <a onClick={() => this.setState(st)}>
                      <i className={prop.icon} />
                      <p>
                        {prop.name + (this.state[prop.state] ? "" : this.getChangeCount())}
                        <b
                          className={
                            this.state[prop.state]
                              ? "caret rotate-180"
                              : "caret"
                          }
                        />
                      </p>
                    </a>
                    <Collapse in={this.state[prop.state]}>
                      <ul className="nav">
                        <li className={""} key={5}>
                          <a className="nav-link" onClick={() => this.props.newPortfolio()}>
                              <i className={"fa fa-file-text-o"} />
                              <p>New</p>
                            </a>
                        </li>                      
                        <li className={""} key={6}>
                          <a className="nav-link" onClick={() => this.onOpenClick()}>
                              <i className={"fa fa-folder-open"} />
                              <p>Open</p>
                            </a>
                        </li>
                        <li className={""} key={7}>
                          <a className="nav-link" onClick={() => this.props.downloadPortfolio()}>
                            <i className={"fa fa-floppy-o"} />
                            <p>Save{this.getChangeCount()}</p>
                          </a>
                        </li>
                      </ul>
                    </Collapse>
                    <InputFiles 
                      onChange={this.props.uploadPortfolioFromFile}
                      accept="application/json">
                      <a id="input-files">
                      </a>
                    </InputFiles>
                  </li>
                );
              } else {
                if (prop.redirect) {
                  return null;
                } else {
                  return (
                    <li className={this.activeRoute(prop.path)} key={key}>
                      <NavLink
                        to={prop.path}
                        className="nav-link"
                        activeClassName="active"
                      >
                        <i className={prop.icon} />
                        <p>{prop.name}</p>
                      </NavLink>
                    </li>
                  );
                }
              }
            })}
            <li className={""} key={8}>
              <a className="nav-link" href="https://docs.google.com/forms/d/e/1FAIpQLSedlJMow1MmI3o6yBNAjtfXUQo05Pb6DVVSRg46PcM9yc8Bow/viewform" target="_blank" rel="noopener noreferrer">
                <i className={"fa fa-comments"} />
                <p>Feedback</p>
              </a>    
            </li>
            <li className={""} key={9}>
              <a className="nav-link" onClick={() => this.props.showHelpPanel()}>
                <i className={"fa fa-question-circle"} />
                <p>Help</p>
              </a>    
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Sidebar;
