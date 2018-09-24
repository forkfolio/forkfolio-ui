import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";

import indexRoutes from "./routes/index.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/sass/light-bootstrap-dashboard.css?v=1.1.1";
import "./assets/css/demo.css";
import "./assets/css/pe-icon-7-stroke.css";



/*
function addComment(comment, txData) {
  return new Promise((accept, reject) => {
    accept(tx.tx);
    return;
  });
}
*/

render();


function render() {
  console.log("Rendering..");
  ReactDOM.render(
    <HashRouter>
      <Switch>
        {indexRoutes.map((prop, key) => {
          return <Route 
                  path={prop.path} 
                  //component={prop.component} 
                  key={key}
                  render={routeProps => (
                    <prop.component
                      {...routeProps}
                      //handleClick={this.handleNotificationClick}
                    />
                  )}
                 />;
        })}
      </Switch>
    </HashRouter>,
    document.getElementById("root")
  );
}
