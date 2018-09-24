/*jshint esversion: 6 */

export default class Ticker {
  constructor(pair, price, time) {
    this.pair = pair;
    this.price = price;
    this.time = time;
  }
}