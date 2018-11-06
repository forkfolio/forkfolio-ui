import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
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
import demofolio from '../../model/init/demofolio.json';
import Currency from "../../model/Currency";
import CurrencyPair from "../../model/CurrencyPair";
import Transaction from "../../model/Transaction";
import UserModel from "../../model/UserModel";
import { config } from "../../config/Config.js";
import FileSaver from 'file-saver';
import cookie from 'react-cookies';
import ConfirmNewPortfolioDialog from "../../views/dialogs/ConfirmNewPortfolioDialog";
import ReactGA from 'react-ga';
import moment from 'moment';


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

    this.hideConfirmNewPortfolioDialog = this.hideConfirmNewPortfolioDialog.bind(this);

    this.addTransaction = this.addTransaction.bind(this);
    this.removeTransaction = this.removeTransaction.bind(this);
    this.updateTransaction = this.updateTransaction.bind(this);

    this.setEditedTransaction = this.setEditedTransaction.bind(this);

    this.fetchRecentPrices = this.fetchRecentPrices.bind(this);
    this.fetchCurrencies = this.fetchCurrencies.bind(this);
    this.getCurrenciesToFetch = this.getCurrenciesToFetch.bind(this);
    this.fetchAllAndRender = this.fetchAllAndRender.bind(this);
    this.fetchHistoday = this.fetchHistoday.bind(this);
    this.isDemo = this.isDemo.bind(this);

    this.updateUserModel = this.updateUserModel.bind(this);

    this.newPortfolio = this.newPortfolio.bind(this);
    this.openPortfolio = this.openPortfolio.bind(this);
    this.savePortfolio = this.savePortfolio.bind(this);
    this.saveCurrentAndCreateNewPortfolio = this.saveCurrentAndCreateNewPortfolio.bind(this);

    this.state = {
      _notificationSystem: null,
      isHelpPanelShown: false,
      isAddTradeDialogShown: false,
      isAddFundingDialogShown: false,
      isEditTradeDialogShown: false,
      isEditFundingDialogShown: false,
      isConfirmNewPortfolioDialogShown: false,
      userModel: userModel,
      resModel: resModel,
      editedTransaction: null,
      changeCount: 0
    };
  }
  
  toTokensString(currencies) {
    let str = "";
    for(let c of currencies) {
      str += (c.code + ",");
    }
  
    return str.slice(0,-1);
  }

  isDemo() {
    return new Promise((accept, reject) => {
      fetch('appversion.json').then(res => res.json()).then((out) => {
        accept(out.isDemo);
        return;
      }).catch(err => { 
        reject(err);
        return;  
      });
    });
  }
  
  fetchRecentPrices() {
    let currencies = this.getCurrenciesToFetch(this.state.userModel);
    if(currencies.length > 0) {
      fetch(config.restURL + 'recent?tokens=' + this.toTokensString(currencies)).then((response) => {
        return response.text()
      }).then((body) => {
        let tickers = JSON.parse(body);
        let count = 0;
        for (let i = 0; i < tickers.length; i++) {
          let newPrice = parseFloat(tickers[i].l/* + Math.random()*/);
          if(resModel.recentTickers.get(currencies[i]) == null ||
            newPrice !== resModel.recentTickers.get(currencies[i]).price) {
            let pair = new CurrencyPair(currencies[i], resModel.usd);
            resModel.recentTickers.set(currencies[i], new Ticker(pair, newPrice, new Date(parseInt(tickers[i].t, 10) * 1000)))
            count++;
          }
        }
        // if there is update, render
        if(count > 0) {
          console.log("Recent prices updated (" + count + " tickers).")
          let newModel = new UserModel(this.state.userModel.transactions, this.state.resModel);
          this.setState({
            userModel: newModel,
            resModel: this.state.resModel.clone()
          });
        }
      });
    }
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
  
  getCurrenciesToFetch(userModel) {
    let currentPortfolio = userModel.portfolios.slice(-1)[0];
    let currencies = [];
    for (const k of currentPortfolio.balances.keys()) {
      currencies.push(k);
    }

    return currencies;
  }
  
  fetchAllAndRender(currencies, daysSince) {

    // prepare all promises
    const promises = [];
    for(let currency of currencies) {
      promises.push(this.fetchHistoday(currency, daysSince));
    }
  
    // resolve, then render
    Promise.all(promises).then(() => {
      console.log("History prices updated (" + promises.length + " series).");

      // re-render
      let newResModel = this.state.resModel.clone();
      let newUserModel = new UserModel(this.state.userModel.transactions, newResModel);
      this.setState({
        userModel: newUserModel,     
        resModel: newResModel
      })
    });
  }
  
  fetchHistoday(currency, days) {
    return new Promise((accept, reject) => {
      fetch(config.restURL + 'histoday?range=' + days + '&tokens=' + currency.code)
      .then((response) => {
        return response.text()
      }).then((body) => {
        let repacked = [];
        for (let t of JSON.parse(body)) {
          let pair = new CurrencyPair(currency, resModel.usd);
          repacked.push(new Ticker(pair, t.l, new Date(parseInt(t.t, 10) * 1000)));
        }
        resModel.dailyTickers.set(currency, repacked);
        accept();
        return;
      });
    });
  }

  componentDidMount() {
    this.setState({ 
      _notificationSystem: this.refs.notificationSystem,
    });
  }

  componentDidUpdate(e) {
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

    // start fetching prices based on user model
    this.fetchCurrencies().then(() => {
      this.isDemo().then((isDemo) => {
        let showHelpPanel = false;
        let newModel;
        if(!isDemo) {
          // check if cookie is not set, then it's the first load, and set it always
          showHelpPanel = cookie.load('showGettingStarted') === undefined;
          cookie.save('showGettingStarted', "1", { path: '/', maxAge: 31536000});

          // if app, set model from local storage if any, or empty
          let portfolioJson = localStorage.getItem('portfolio01');
          if(portfolioJson != null && portfolioJson !== '') {
            let portfolioObject = JSON.parse(portfolioJson);
            newModel = this.updateUserModel(portfolioObject.transactions, portfolioObject.changeCount);
            console.log('Loaded portfolio from local storage.')
          } else {
            newModel = this.updateUserModel([], 0);
          }
        } else {
          // if demo, set model from demofolio file
          newModel = this.updateUserModel(demofolio.transactions, 0);
          console.log('Loaded default portfolio.')
        }

        this.setState({
          isHelpPanelShown: showHelpPanel,
          isDemo: isDemo,
        });

        let firstDate = new Date(newModel.transactions[0].time);
        let daysSince = this.getDaysSince(firstDate);

        this.fetchAllAndRender(this.getCurrenciesToFetch(newModel), daysSince + 2);
        // start checking recent prices periodically
        setInterval(this.fetchRecentPrices, 2000);
      });
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
          Notification text
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

  
  hideConfirmNewPortfolioDialog() {
    this.setState({ isConfirmNewPortfolioDialogShown: false });
  }

  getDaysSince(sinceDate) {
    return moment(new Date()).diff(moment(sinceDate), 'days');
  }

  addTransaction(tx) {
    let isOldest = true, hasNewBalance = true;
    // check if historic prices need to be updated
    if(this.state.userModel.portfolios[1] != null) {
      let firstDate = new Date(this.state.userModel.portfolios[1].genesisTx.time);
      isOldest = this.getDaysSince(new Date(tx.time)) > this.getDaysSince(firstDate);
      hasNewBalance = !this.state.userModel.portfolios.slice(-1)[0].balances.has(tx.pair.base);
    }

    // add transaction and sort
    this.state.userModel.transactions.push(tx);
    this.state.userModel.transactions.sort((a, b) => {
      return a.time - b.time;
    });

    // update userModel
    let newModel = new UserModel(this.state.userModel.transactions, this.state.resModel);
    let newChangeCount = this.state.changeCount + 1;
    this.setState({
      userModel: newModel,
      changeCount: newChangeCount
    });

    // save to local storage
    localStorage.setItem('portfolio01', this.getPortfolioJson(newModel, newChangeCount));

    // updade historic prices if needed
    if(hasNewBalance || isOldest) {
      let firstDate = newModel.portfolios[1].genesisTx.time;
      this.fetchAllAndRender(this.getCurrenciesToFetch(newModel), this.getDaysSince(firstDate) + 2);
    }

    console.log("Transaction added. " + newModel.transactions.length + " transactions in user model.");
  }

  updateTransaction(tx) {
    // check if historic prices need to be updated
    let firstDate = new Date(this.state.userModel.portfolios[1].genesisTx.time);
    let isOldest = this.getDaysSince(new Date(tx.time)) > this.getDaysSince(firstDate);
    let hasNewBalance = !this.state.userModel.portfolios.slice(-1)[0].balances.has(tx.pair.base);

    // remove, add, sort
    let newTransactions = this.state.userModel.transactions.filter((item) => { 
      return item !== this.state.editedTransaction;
    })
    newTransactions.push(tx);
    newTransactions.sort((a, b) => {
      return a.time - b.time;
    });

    // update userModel
    let newModel = new UserModel(newTransactions, this.state.resModel);
    let newChangeCount = this.state.changeCount + 1;
    this.setState({
      userModel: newModel,
      changeCount: newChangeCount
    });

    // save to local storage
    localStorage.setItem('portfolio01', this.getPortfolioJson(newModel, newChangeCount));

    // updade historic prices if needed
    if(hasNewBalance || isOldest) {
      let firstDate = newModel.portfolios[1].genesisTx.time;
      this.fetchAllAndRender(this.getCurrenciesToFetch(newModel), this.getDaysSince(firstDate) + 2);
    }

    console.log("Transaction added. " + newModel.transactions.length + " transactions in user model.");
  }

  removeTransaction(tx) {
    // check if historic prices need to be updated
    let firstDate = new Date(this.state.userModel.portfolios[1].genesisTx.time);
    let isOldest = this.getDaysSince(new Date(tx.time)) >= this.getDaysSince(firstDate);
    let hasNewBalance = !this.state.userModel.portfolios.slice(-1)[0].balances.has(tx.pair.base);

    // remove, and sort
    let newTransactions = this.state.userModel.transactions.filter((item) => { 
      return item !== tx;
    });
    newTransactions.sort((a, b) => {
      return a.time - b.time;
    });
  
    // update userModel
    let newModel = new UserModel(newTransactions, this.state.resModel);
    let newChangeCount = this.state.changeCount + 1;
    this.setState({
      userModel: newModel,
      changeCount: newChangeCount
    });

    // save to local storage
    localStorage.setItem('portfolio01', this.getPortfolioJson(newModel, newChangeCount));

    // updade historic prices if needed
    if(hasNewBalance || isOldest) {
      let firstDate = newModel.portfolios[1].genesisTx.time;
      this.fetchAllAndRender(this.getCurrenciesToFetch(newModel), this.getDaysSince(firstDate) + 2);
    }

    console.log("Transaction removed. " + newModel.transactions.length + " transactions in user model.");
  }

  setEditedTransaction(tx) {
    this.setState({ editedTransaction: tx });
  }

  newPortfolio() {
    // if there are unsaved changes, show confirm dialog
    if(this.state.changeCount > 0 && !this.state.isConfirmNewPortfolioDialogShown) {
      this.setState({
        isConfirmNewPortfolioDialogShown: true
      });
    } else {
      console.log("New portfolio created");
      // save to model
      this.updateUserModel([], 0);

      // save to local storage
      localStorage.setItem('portfolio01', '');

      this.setState({ isConfirmNewPortfolioDialogShown: false });

      ReactGA.event({category: 'User', action: 'New'});
    }
  }

  saveCurrentAndCreateNewPortfolio() {
    this.savePortfolio();
    this.newPortfolio();
  }


  updateUserModel(fileFormatTransactions, changeCount) {
    let transactions = this.stringifiedToObjectsTransactions(fileFormatTransactions);
    // update userModel with new transactions
    let newModel = new UserModel(transactions, this.state.resModel);
    this.setState({
      userModel: newModel,
      changeCount: changeCount
    });

    return newModel;
  }

  openPortfolio(files) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      // TODO: check if format ok, version number

      // save to local storage
      localStorage.setItem('portfolio01', reader.result);

      // parse json string to object
      let portfolioObj = JSON.parse(reader.result);

      // set new model, and get prices
      let newModel = this.updateUserModel(portfolioObj.transactions, 0);
      let firstDate = newModel.portfolios[1].genesisTx.time;
      this.fetchAllAndRender(this.getCurrenciesToFetch(newModel), this.getDaysSince(firstDate) + 2);

      ReactGA.event({category: 'User', action: 'Open'});
    }, false);
    if (files.length > 0) {
      reader.readAsText(files[0]);
    } else {
      //this.props.showError(new InpulidationError("Portfolio file should be in JSON file format."));
    }
  }

  savePortfolio() {
    // create json string
    let portfolioJson = this.getPortfolioJson(this.state.userModel, 0);

    // save to local storage
    localStorage.setItem('portfolio01', portfolioJson);

    // save to file
    let file = new File([portfolioJson], "portfolio" + this.state.userModel.transactions.length + ".json", {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(file);

    this.setState({
      changeCount: 0
    });

    ReactGA.event({category: 'User', action: 'Save'});
  }

  getPortfolioJson(userModel, changeCount) {
    let fileTransactions = [];
    for(let tx of userModel.transactions) {
      let trade = {
        isTrade: tx.isTrade,
        isBuy: tx.isBuy,
        pair: tx.pair.base.code + "/" + tx.pair.counter.code,
        baseAmount: tx.baseAmount,
        counterAmount: tx.counterAmount,
        time: tx.time.getTime(),
        comment: tx.comment
      }
      fileTransactions.push(trade);
    }
    let portfolioFile = {
      version: 1,
      transactions: fileTransactions,
      changeCount: changeCount
    }

    return JSON.stringify(portfolioFile, null, "\t");
  }

  stringifiedToObjectsTransactions(fileFormatTransactions) {
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

    return transactions;
  }

  render() {
    let confirmNewPortfolioDialog = (
      <ConfirmNewPortfolioDialog
        isDialogShown={this.state.isConfirmNewPortfolioDialogShown}
        hideDialog={this.hideConfirmNewPortfolioDialog}
        createNew={this.newPortfolio}
        saveCurrentAndCreateNew={this.saveCurrentAndCreateNewPortfolio}
        changeCount={this.state.changeCount}
      />
    );

    return (
      <div className="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <Sidebar {...this.props}
          newPortfolio={this.newPortfolio} 
          uploadPortfolioFromFile={this.openPortfolio} 
          downloadPortfolio={this.savePortfolio} 
          showHelpPanel={this.showHelpPanel} 
          userModel={this.state.userModel}
          resModel={this.state.resModel}
          changeCount={this.state.changeCount}
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
          {this.state.isConfirmNewPortfolioDialogShown ? confirmNewPortfolioDialog : ""}
        </div>
      </div>
    );
  }
}

export default Dashboard;
