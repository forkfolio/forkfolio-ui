import React, { Component } from "react";
import { Grid, Col, Row } from "react-bootstrap";
import ReactTable from "react-table";
import Highstock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import Card from "components/Card/Card.jsx";
import PortfolioPie from './common/PortfolioPie';
import HelpCard from './common/HelpCard';
import { formatUtils } from './../utils/FormatUtils';
import { rangeSelectorModel } from "../model/init/ResModelInit.js";

class PortfolioView extends Component {
  constructor(props) {
    super(props);
    this.getPerformanceChartOptions = this.getPerformanceChartOptions.bind(this);
    this.getTotalBalance = this.getTotalBalance.bind(this);
    this.getTableColumns = this.getTableColumns.bind(this);
    this.getTableData = this.getTableData.bind(this);
  }

  getTotalBalance(rows) {
    let total = 0;
    for (let row of rows.data) {
      total += row.total;
    }
    return total;
  }

  getTableColumns() {
    const tableColumns = [
      { Header: "Name", accessor: "name", maxWidth: 180, },
      { Header: "Balance", accessor: "balance", maxWidth: 130, sortable: false, 
      Cell: row => (
        <span style={{
          float: "right"
        }}>
          {formatUtils.formatNumber(row.value[0], 2) + " " + row.value[1]}
        </span>
      )},
      { Header: "Price", accessor: "price", maxWidth: 120,
      Cell: row => (
        <span style={{
          float: "right"
        }}>
          {formatUtils.formatNumber(row.value, 2) + " USD"}
        </span>
      ),
      sortMethod: (a, b) => {
        return b - a;
      }},
      { Header: "Share", accessor: "share", maxWidth: 80, 
      Footer: (
        <span style={{
          float: "right"
        }}>
          <strong>100%</strong>{" "}
        </span>
      ),
      Cell: row => (
        <span style={{
          float: "right"
        }}>
          {formatUtils.formatNumber(row.value, 2) + "%"}
        </span>
      ),
      sortMethod: (a, b) => {
        return b - a;
      }},
      { Header: "Total", accessor: "total", minWidth: 120, maxWidth: 140, 
      Footer: rows => (
        <span style={{
          float: "right"
        }}>
          <strong>{formatUtils.formatNumber(this.getTotalBalance(rows), 2) + " USD"}</strong>
        </span>
      ),
      Cell: row => (
        <span style={{
          float: "right"
        }}>
          {formatUtils.formatNumber(row.value, 2) + " USD"}
        </span>
      ),
      sortMethod: (a, b) => {
        return b - a;
      }}
    ];

    return tableColumns;
  }

  getTableData(props) {
    let currentPortfolio = props.userModel.portfolios.slice(-1)[0];
    let totalBalance = currentPortfolio.getTotalBalance(props.resModel, props.resModel.usd);

    const tableData = [];
    for (let [k, v] of currentPortfolio.balances) {
      let currencyBalance = currentPortfolio.getCurrencyBalance(props.resModel, k, props.resModel.usd);
      let name = k.name;
      let balance = [v, k.code];
      let price = props.resModel.getLastPrice(k, props.resModel.usd);
      let share = (currencyBalance / totalBalance * 100);
      let total = currencyBalance;
      tableData.push({
        id: tableData.length, 
        name: name, 
        balance: balance,
        price: price,
        share: share,
        total: total
      });
    }

    return tableData;
  }

  getPerformanceChartOptions(props) {
    let currentPortfolio = props.userModel.portfolios.slice(-1)[0];

    // prepare portfolio performance chart
    const series = [];
    for (const currency of currentPortfolio.balances.keys()) {
      const serie = [];
      for(let t of props.resModel.dailyTickers.get(currency)) {       
          let balanceInDenominated = t.price * currentPortfolio.getPastBalance(t.pair.base, t.time);
          serie.push([t.time.getTime(), balanceInDenominated]);
      }
      // take the last price and update it with recent price
      if(serie.slice(-1)[0] != null) {
        serie.slice(-1)[0][1] = currentPortfolio.getCurrencyBalance(props.resModel, currency, props.resModel.usd)
        series.push({name: currency.code, data: serie});
      }
    }

    const performanceOptions = {
      chart: {
        type: 'area'
      },
      title: {
        text: null
      },
      plotOptions: {
        series: {
          stacking: 'normal',
          lineColor: '#666666',
          lineWidth: 1,
          marker: {
              lineWidth: 1,
              lineColor: '#666666'
          }
        }
      },     
      series: series,
      rangeSelector: rangeSelectorModel,
      tooltip: {
        shared: true, // this doesn't work
        valueSuffix: ' USD',
        valueDecimals: 2
      },
      credits: {
        enabled: false
      }
    }

    return performanceOptions;
  }

  render() {
    let currentPortfolio = this.props.userModel.portfolios.slice(-1)[0];
    let assetCount = currentPortfolio.balances.size;
    const showPagination = assetCount > 10;
    return (
      <div className="main-content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <HelpCard 
                isHelpPanelShown={this.props.isHelpPanelShown}
                hideHelpPanel={this.props.hideHelpPanel}
              />
            </Col>
          </Row>
          <Row>
            <Col md={8}>
              <Card
                title="What is my asset allocation?"
                category={assetCount + " asset" + (assetCount > 1 ? "s" : "")}
                content={
                  <ReactTable
                    className="-striped -highlight"
                    data={this.getTableData(this.props)}
                    columns={this.getTableColumns(this.props)}
                    defaultPageSize={10}
                    showPageSizeOptions={false}
                    showPagination={showPagination}
                    noDataText={() => formatUtils.getNoDataText('assets', this.props.userModel)} 
                  />
                }
              />
            </Col>
            <Col md={4}>
              <PortfolioPie
                title="Current portfolio"
                portfolio={this.props.userModel.portfolios.slice(-1)[0]}
                resModel={this.props.resModel}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card
                title="What is my portfolio history?"
                //category="24 Hours performance"
                content={
                  <HighchartsReact
                    highcharts={Highstock}
                    constructorType={'stockChart'}
                    options={this.getPerformanceChartOptions(this.props)}
                  />
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default PortfolioView;
