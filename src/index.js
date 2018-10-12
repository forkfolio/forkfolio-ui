import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import indexRoutes from "./routes/index.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/sass/light-bootstrap-dashboard.css?v=1.1.1";
import "./assets/css/demo.css";
import "./assets/css/pe-icon-7-stroke.css";
import ReactGA from 'react-ga';

console.log(window.location.pathname + window.location.hash);

function initializeReactGA() {
  ReactGA.initialize('UA-112760038-1');
}

function render() {
  console.log("Rendering..");
  ReactDOM.render(
    <HashRouter>
      <Switch>
        {indexRoutes.map((prop, key) => {
          return <Route 
                  path={prop.path} 
                  key={key}
                  render={routeProps => (
                    <prop.component
                      {...routeProps}
                    />
                  )}
                 />;
        })}
      </Switch>
    </HashRouter>,
    document.getElementById("root")
  );
}

initializeReactGA();
render();
