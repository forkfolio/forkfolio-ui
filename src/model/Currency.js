/*jshint esversion: 6 */

export default class Currency {
  constructor(code, name, rank, isFiat = false) {
    this.code = code;
    this.name = name;
    this.rank = rank;
    this.isFiat = isFiat;
  }
}
