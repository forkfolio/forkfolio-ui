import PortfolioView from "views/PortfolioView.jsx";
import TradesView from "views/TradesView.jsx";
import PositionsView from "views/PositionsView.jsx";
import FundingView from "views/FundingView.jsx";
import PerformanceView from "views/PerformanceView.jsx";

var dashboardRoutes = [
  {
    path: "/portfolio",
    name: "Portfolio",
    icon: "fa fa-pie-chart",
    component: PortfolioView
  }, {
    path: "/trades",
    name: "Trades",
    icon: "fa fa-retweet",
    component: TradesView
  }, {
    path: "/positions",
    name: "Positions",
    icon: "fa fa-piggy-bank",
    component: PositionsView
  }, {
    path: "/funding",
    name: "Funding",
    icon: "fa fa-money",
    component: FundingView
  }, {
    path: "/performance",
    name: "Performance",
    icon: "fa fa-line-chart",//fa fa-calculator, fa fa-area-chart
    component: PerformanceView
  }, {
    collapse: true,
    path: "/manage",
    name: "Manage",
    state: "openManage",
    icon: "fa fa-folder",
    views: [
      {
        path: "/placeholder",
        name: "Placeholder",
        mini: "P",
        component: null
      }
    ]
  },
  /*{
    path: "https://docs.google.com/forms/d/e/1FAIpQLSedlJMow1MmI3o6yBNAjtfXUQo05Pb6DVVSRg46PcM9yc8Bow/viewform",
    name: "Feedback",
    icon: "fa fa-comments",
    component: null
  },*/
  { redirect: true, path: "/", pathTo: "/portfolio", name: "Portfolio" }
];
export default dashboardRoutes;
