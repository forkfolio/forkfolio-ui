/*jshint esversion: 6 */

export default class Ticker {
  constructor(pair, price, time, percentChange24h) {
    this.pair = pair;
    this.price = price;
    this.time = time;
    this.percentChange24h = percentChange24h;
  }
}