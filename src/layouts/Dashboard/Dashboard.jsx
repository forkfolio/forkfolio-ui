import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
// this is used to create scrollbars on windows devices like the ones from apple devices
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// react component that creates notifications (like some alerts with messages)
import NotificationSystem from "react-notification-system";

import Sidebar from "components/Sidebar/Sidebar.jsx";
import Header from "components/Header/Header.jsx";
import Footer from "components/Footer/Footer.jsx";
import Promise from "bluebird";
// dinamically create dashboard routes
import dashboardRoutes from "routes/dashboard.jsx";

// style for notifications
import { style } from "variables/Variables.jsx";
import { userModel, resModel } from "../../model/init/ResModelInit.js";

import Ticker from "../../model/Ticker";
import portfolioTransactions from '../../model/init/portfolio.json';
import Currency from "../../model/Currency";
import CurrencyPair from "../../model/CurrencyPair";
import Transaction from "../../model/Transaction";
import UserModel from "../../model/UserModel";
import { config } from "../../config/Config.js";
import FileSaver from 'file-saver';

var ps;

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.handleNotificationClick = this.handleNotificationClick.bind(this);
    
    this.showHelpPanel = this.showHelpPanel.bind(this);
    this.hideHelpPanel = this.hideHelpPanel.bind(this);

    this.showAddTradeDialog = this.showAddTradeDialog.bind(this);
    this.hideAddTradeDialog = this.hideAddTradeDialog.bind(this);
    this.showAddFundingDialog = this.showAddFundingDialog.bind(this);
    this.hideAddFundingDialog = this.hideAddFundingDialog.bind(this);

    this.showEditTradeDialog = this.showEditTradeDialog.bind(this);
    this.hideEditTradeDialog = this.hideEditTradeDialog.bind(this);
    this.showEditFundingDialog = this.showEditFundingDialog.bind(this);
    this.hideEditFundingDialog = this.hideEditFundingDialog.bind(this);

    this.addTransaction = this.addTransaction.bind(this);
    this.removeTransaction = this.removeTransaction.bind(this);
    this.updateTransaction = this.updateTransaction.bind(this);

    this.setEditedTransaction = this.setEditedTransaction.bind(this);

    this.fetchRecentPrices = this.fetchRecentPrices.bind(this);
    this.updateUserModel = this.updateUserModel.bind(this);
    this.fetchCurrencies = this.fetchCurrencies.bind(this);
    this.getCurrenciesToFetch = this.getCurrenciesToFetch.bind(this);
    this.fetchAllAndRender = this.fetchAllAndRender.bind(this);
    this.fetchHistoday = this.fetchHistoday.bind(this);

    this.newPortfolio = this.newPortfolio.bind(this);
    this.uploadPortfolioFromFile = this.uploadPortfolioFromFile.bind(this);
    this.downloadPortfolio = this.downloadPortfolio.bind(this);
    this.state = {
      _notificationSystem: null,
      isHelpPanelShown: true,
      isAddTradeDialogShown: false,
      isAddFundingDialogShown: false,
      isEditTradeDialogShown: false,
      isEditFundingDialogShown: false,
      userModel: userModel,
      resModel: resModel,
      editedTransaction: null
    };
  }
  
  toTokensString(currencies) {
    let str = "";
    for(let c of currencies) {
      str += (c.code + ",");
    }
  
    return str.slice(0,-1);
  }
  
  fetchRecentPrices() {
    let currencies = this.getCurrenciesToFetch();
    if(currencies.length > 0) {
      fetch(config.restURL + 'recent?tokens=' + this.toTokensString(currencies))
      .then((response) => {
        return response.text()
      }).then((body) => {
        let tickers = JSON.parse(body);
        let count = 0;
        for (let i = 0; i < tickers.length; i++) {
          let newPrice = parseFloat(tickers[i].l);
          if(resModel.recentTickers.get(currencies[i]) == null ||
            newPrice !== resModel.recentTickers.get(currencies[i]).price) {
            let pair = new CurrencyPair(currencies[i], resModel.usd);
            resModel.recentTickers.set(currencies[i], new Ticker(pair, parseFloat(tickers[i].l) /*+ Math.random() * 5*/, new Date(parseInt(tickers[i].t, 10) * 1000)))
            count++
          }
        }
        // if there is update, render
        if(count > 0) {
          console.log(count + " new recent prices updated. Updating UI..")
          let newModel = new UserModel(this.state.userModel.transactions, this.state.resModel);
          this.setState({
            userModel: newModel,
            resModel: this.state.resModel.clone()
          })
        }
      });
    }
  }
  
  updateUserModel(fileFormatTransactions) {
    // got through file transactions, and create objects from pair strings
    let transactions = [];
    for(let t of fileFormatTransactions) {
      let pairStr = t.pair.split('/');
      let base = resModel.findCurrencyByCode(pairStr[0]);
      let counter = resModel.findCurrencyByCode(pairStr[1]);
      if(base !== null && counter !== null) {
        let pair = new CurrencyPair(base, counter);
        let tx = new Transaction(t.isTrade, t.isBuy, pair, t.baseAmount, t.counterAmount, new Date(t.time), t.comment);
        transactions.push(tx);
      }
    }
    
    // update userModel with new transactions
    let newModel = new UserModel(transactions, this.state.resModel);
    this.setState({
      userModel: newModel
    })
  }
  
  // fetches a list of all curencies, crypto and fiat, and stores them in resModel
  fetchCurrencies() {
    return new Promise((accept, reject) => {
      fetch(config.restURL + 'currencies').then((response) => {
        return response.text()
      }).then((body) => {
        for (let c of JSON.parse(body)) {
          let currency = new Currency(c.c, c.n, c.r, c.f);
          resModel.dailyTickers.set(currency, []);
          if(currency.code === 'USD') {
            resModel.usd = currency;
          }
        }
        accept();
        return;
      })
    });
  }
  
  getCurrenciesToFetch() {
    let currentPortfolio = this.state.userModel.portfolios.slice(-1)[0];
    let currencies = [];
    for (const k of currentPortfolio.balances.keys()) {
      currencies.push(k);
    }

    //console.log(currencies);
    return currencies;
  }
  
  fetchAllAndRender(currencies) {
    // prepare all promises
    const promises = [];
    for(let currency of currencies) {
      promises.push(this.fetchHistoday(currency));
    }
  
    // resolve, then render
    Promise.all(promises).then(() => {
      console.log("Histoday prices collected.");

      // re-render
      let newResModel = this.state.resModel.clone();
      let newUserModel = new UserModel(this.state.userModel.transactions, newResModel);
      this.setState({
        userModel: newUserModel,     
        resModel: newResModel
      })
    });
  }
  
  fetchHistoday(currency) {
    return new Promise((accept, reject) => {
      fetch(config.restURL + 'histoday?range=1096&tokens=' + currency.code)
      .then((response) => {
        return response.text()
      }).then((body) => {
        let repacked = [];
        for (let t of JSON.parse(body)) {
          let pair = new CurrencyPair(currency, resModel.usd);
          repacked.push(new Ticker(pair, t.l, new Date(parseInt(t.t, 10) * 1000)));
        }
        resModel.dailyTickers.set(currency, repacked);
  
        // after updating ether, add tickers for usd (use ETH times)
        // TODO: if no eth in portfoli, it's a bug
        if(currency.code === 'ETH') {
          resModel.calculateUsdTickers(currency);
        }
        accept();
        return;
      })
    });
  }

  // safely change state here
  componentWillReceiveProps(nextProps) {
    /*this.setState({
      userModel: this.props.userModel,
      resModel: this.props.resModel
    });*/
  }
  componentDidMount() {
    this.setState({ 
      _notificationSystem: this.refs.notificationSystem,
    });
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.refs.mainPanel);
    }
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
    }
  }
  componentDidUpdate(e) {
    if (navigator.platform.indexOf("Win") > -1) {
      setTimeout(() => {
        ps.update();
      }, 350);
    }
    if (e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainPanel.scrollTop = 0;
    }
    if (
      window.innerWidth < 993 &&
      e.history.action === "PUSH" &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
    }
  }

  componentWillMount() {
    this.fetchCurrencies().then(() => {
    
      this.updateUserModel(portfolioTransactions);

      this.fetchAllAndRender(this.getCurrenciesToFetch());
    
      // start checking recent prices periodically
      setInterval(this.fetchRecentPrices, 2000);
    });
    

    if (document.documentElement.className.indexOf("nav-open") !== -1) {
      document.documentElement.classList.toggle("nav-open");
    }
  }
  // function that shows/hides notifications - it was put here, because the wrapper div has to be outside the main-panel class div
  handleNotificationClick(position) {
    var color = Math.floor(Math.random() * 4 + 1);
    var level;
    switch (color) {
      case 1:
        level = "success";
        break;
      case 2:
        level = "warning";
        break;
      case 3:
        level = "error";
        break;
      case 4:
        level = "info";
        break;
      default:
        break;
    }
    this.state._notificationSystem.addNotification({
      title: <span data-notify="icon" className="pe-7s-gift" />,
      message: (
        <div>
          Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for
          every web developer.
        </div>
      ),
      level: level,
      position: position,
      autoDismiss: 15
    });
  }

  // TODO: merge show hide to one

  showHelpPanel() {
    this.setState({ isHelpPanelShown: true });
  }

  hideHelpPanel() {
    console.log("Hide help panel")
    this.setState({ isHelpPanelShown: false });
  }

  showAddTradeDialog() {
    this.setState({ isAddTradeDialogShown: true });
  }

  hideAddTradeDialog() {
    this.setState({ isAddTradeDialogShown: false });
  }

  showAddFundingDialog() {
    this.setState({ isAddFundingDialogShown: true });
  }

  hideAddFundingDialog() {
    this.setState({ isAddFundingDialogShown: false });
  }

  showEditTradeDialog() {
    this.setState({ isEditTradeDialogShown: true });
  }

  hideEditTradeDialog() {
    this.setState({ isEditTradeDialogShown: false });
  }

  showEditFundingDialog() {
    this.setState({ isEditFundingDialogShown: true });
  }

  hideEditFundingDialog() {
    this.setState({ isEditFundingDialogShown: false });
  }

  addTransaction(tx) {
    // check if historic prices need to be updated
    let shouldFetch = !this.state.userModel.portfolios.slice(-1)[0].balances.has(tx.pair.base);

    // add transaction 
    // TODO sort maybe?
    this.state.userModel.transactions.push(tx);

    // update userModel
    let newModel = new UserModel(this.state.userModel.transactions, this.state.resModel);
    this.setState({
      userModel: newModel
    });

    console.log("Transaction added to user model.");
    console.log(newModel.transactions.length + " transactions in userModel");

    if(shouldFetch) {
      this.fetchAllAndRender(this.getCurrenciesToFetch());
    }
  }

  updateTransaction(tx) {
    // remove
    let newTransactions = this.state.userModel.transactions.filter((item) => { 
      return item !== this.state.editedTransaction;
    })
    // add
    newTransactions.push(tx);

    // update userModel
    let newModel = new UserModel(newTransactions, this.state.resModel);
    this.setState({
      userModel: newModel
    });

    console.log("Transaction updated.");
    console.log(newModel.transactions.length + " transactions in userModel");
  }

  removeTransaction(tx) {
    // remove transaction
    let newTransactions = this.state.userModel.transactions.filter((item) => { 
      return item !== tx;
    })
  
    // update userModel
    let newModel = new UserModel(newTransactions, this.state.resModel);
    this.setState({
      userModel: newModel
    });

    console.log("Transaction removed from user model.");
    console.log(newModel.transactions.length + " transactions in userModel");
  }

  setEditedTransaction(tx) {
    this.setState({
      editedTransaction: tx
    })
  }

  newPortfolio() {
    console.log("New portfolio");
    this.updateUserModel([]);
    //this.fetchAllAndRender(this.getCurrenciesToFetch());
    /*const reader = new FileReader();
    reader.addEventListener("load", () => {
      // TODO: check if format ok, version number
      this.updateUserModel(JSON.parse(reader.result).transactions);
      this.fetchAllAndRender(this.getCurrenciesToFetch());
    }, false);
    if (files.length > 0) {
      reader.readAsText(files[0]);
    } else {
      //this.props.showError(new InputValidationError("Portfolio file should be in JSON file format."));
    }*/
  }

  uploadPortfolioFromFile(files) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      // TODO: check if format ok, version number
      this.updateUserModel(JSON.parse(reader.result).transactions);
      this.fetchAllAndRender(this.getCurrenciesToFetch());
    }, false);
    if (files.length > 0) {
      reader.readAsText(files[0]);
    } else {
      //this.props.showError(new InputValidationError("Portfolio file should be in JSON file format."));
    }
  }

  downloadPortfolio() {
    let fileTransactions = [];
    for(let t of this.state.userModel.transactions) {
      let trade = {
        isTrade: t.isTrade,
        isBuy: t.isBuy,
        pair: t.pair.base.code + "/" + t.pair.counter.code,
        baseAmount: t.baseAmount,
        counterAmount: t.counterAmount,
        time: t.time.getTime(),
        comment: t.comment
      }
      fileTransactions.push(trade);
    }
    let portfolioFile = {
      version: 1,
      transactions: fileTransactions
    }
    let formattedFile = JSON.stringify(portfolioFile, null, "\t");
    let file = new File([formattedFile], "portfolio" + fileTransactions.length + ".json", {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(file);
  }

  render() {
    return (
      <div className="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <Sidebar {...this.props}
          newPortfolio={this.newPortfolio} 
          uploadPortfolioFromFile={this.uploadPortfolioFromFile} 
          downloadPortfolio={this.downloadPortfolio} 
          showHelpPanel={this.showHelpPanel} 
          userModel={this.state.userModel}
          resModel={this.state.resModel}
        />
        <div
          className={
            "main-panel" +
            (this.props.location.pathname === "/maps/full-screen-maps"
              ? " main-panel-maps"
              : "")
          }
          ref="mainPanel"
        >
          <Header 
            location={this.props.location}
            userModel={this.state.userModel}
            resModel={this.state.resModel}
          />
          <Switch>
            {dashboardRoutes.map((prop, key) => {
              if (prop.collapse) {
                return prop.views.map((prop, key) => {
                  if (prop.name === "Notifications") {
                    return (
                      <Route
                        path={prop.path}
                        key={key}
                        render={routeProps => (
                          <prop.component
                            {...routeProps}
                            handleClick={this.handleNotificationClick}
                          />
                        )}
                      />
                    );
                  } else {
                    return (
                      <Route
                        path={prop.path}
                        component={prop.component}
                        key={key}
                      />
                    );
                  }
                });
              } else {
                if (prop.redirect)
                  return (
                    <Redirect from={prop.path} to={prop.pathTo} key={key} />
                  );
                else
                  return (
                    <Route
                      path={prop.path}
                      //component={prop.component}
                      key={key}
                      render={routeProps => (
                        <prop.component
                          {...routeProps}
                          handleClick={this.handleNotificationClick}
                          userModel={this.state.userModel}
                          resModel={this.state.resModel}

                          isHelpPanelShown={this.state.isHelpPanelShown}
                          hideHelpPanel={this.hideHelpPanel}

                          isAddTradeDialogShown={this.state.isAddTradeDialogShown}
                          showAddTradeDialog={this.showAddTradeDialog}
                          hideAddTradeDialog={this.hideAddTradeDialog}

                          isAddFundingDialogShown={this.state.isAddFundingDialogShown}
                          showAddFundingDialog={this.showAddFundingDialog}
                          hideAddFundingDialog={this.hideAddFundingDialog}

                          isEditTradeDialogShown={this.state.isEditTradeDialogShown}
                          showEditTradeDialog={this.showEditTradeDialog}
                          hideEditTradeDialog={this.hideEditTradeDialog}

                          isEditFundingDialogShown={this.state.isEditFundingDialogShown}
                          showEditFundingDialog={this.showEditFundingDialog}
                          hideEditFundingDialog={this.hideEditFundingDialog}

                          addTransaction={this.addTransaction}
                          removeTransaction={this.removeTransaction}

                          updateTransaction={this.updateTransaction}
                          setEditedTransaction={this.setEditedTransaction}
                          editedTransaction={this.state.editedTransaction}
                        />
                      )}
                    />
                  );
              }
            })}
          </Switch>
          <Footer fluid />
        </div>
      </div>
    );
  }
}

export default Dashboard;
