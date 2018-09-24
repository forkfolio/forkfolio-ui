import React, { Component } from "react";
import { Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";

class PagesHeader extends Component {
  constructor(props) {
    super(props);
    this.mobileSidebarToggle = this.mobileSidebarToggle.bind(this);
    this.state = {
      width: window.innerWidth
    };
  }
  // function that sets the class to active of the active page
  activeRoute(routeName) {
    return window.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  }
  // function that shows/hides sidebar on responsive
  mobileSidebarToggle(e) {
    document.documentElement.classList.toggle("nav-open");
  }
  updateWidth() {
    this.setState({ width: window.innerWidth });
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateWidth.bind(this));
  }
  render() {
    return (
      <Navbar
        collapseOnSelect
        inverse
        className="navbar-primary navbar-transparent navbar-absolute"
      >
        <Navbar.Header>
          <Navbar.Brand>
            <NavLink to={"/dashboard"} className="nav-link">
              {this.state.width > 429
                ? "Secure Crypto Portfolio - ForkFolio"
                : "ForkFolio"}
            </NavLink>
          </Navbar.Brand>
          <Navbar.Toggle onClick={this.mobileSidebarToggle} />
        </Navbar.Header>
        <Navbar.Collapse>
          <ul className="nav navbar-nav navbar-right">
            <li>
              <NavLink to={"/dashboard"} className="nav-link">
                <i className="fa fa-th-list" />
                <p>Dashboard</p>
              </NavLink>
            </li>
            <li className={this.activeRoute("login-page")}>
              <NavLink to={"/pages/login-page"} className="nav-link">
                <i className="fa fa-drivers-license-o" />
                <p>Login</p>
              </NavLink>
            </li>
            <li className={this.activeRoute("register-page")}>
              <NavLink to={"/pages/register-page"} className="nav-link">
                <i className="fa fa-user-circle-o" />
                <p>Register</p>
              </NavLink>
            </li>
            <li className={this.activeRoute("lock-screen-page")}>
              <NavLink to={"/pages/lock-screen-page"} className="nav-link">
                <i className="fa fa-lock" />
                <p>Lock Screen</p>
              </NavLink>
            </li>
          </ul>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default PagesHeader;
