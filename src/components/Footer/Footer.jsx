import React, { Component } from "react";
import packageJson from "../../../package.json";

class Footer extends Component {
  /*
  <li>
    <a href="https://facebook.com/link-here">
      <i className="fa fa-facebook"></i> Facebook 
    </a>
  </li>
  <li>
    <a href="https://googleplus.com/link-here">
      <i className="fa fa-google-plus"></i> Google Plus 
    </a>
  </li>
  */
  render() {
    return (
      <footer
        className={
          "footer" +
          (this.props.transparent !== undefined ? " footer-transparent" : "")
        }
      >
        <div
          className={
            "container" + (this.props.fluid !== undefined ? "-fluid" : "")
          }
        >
          <nav className="pull-left">
            <ul>
              <li>
                <a href="https://twitter.com/forkfol_io">
                  <i className="fa fa-twitter"></i> Twitter 
                </a>
              </li>             
            </ul>
          </nav>
          <p className="copyright pull-right">
            Copyright &copy; {1900 + new Date().getYear()}{" "} ForkFol.io {packageJson.version}
          </p>
        </div>
      </footer>
    );
  }
}
export default Footer;
