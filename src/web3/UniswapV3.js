//import { CoinGeckoPrices } from './CoinGeckoPrices.js';
//import uniswapABI from "../abis/uniswapABI.json";
//import daiABI from "../abis/daiABI.json";
//import { usdcAddress, getContractInstance } from './common.js'
		
export default class UniswapV3 {		
	constructor(myBASE, myUNDER, openingPrice, minPrice, maxPrice, feeInPercent) {
		this.myBASE = myBASE;             // user invested in BASE
		this.myUNDER = myUNDER;           // user invested in UNDER
		this.openingPrice = openingPrice; // price when liq position is opened
		this.minPrice = minPrice;
		this.maxPrice = maxPrice;
		this.feeInPercent = feeInPercent;

		// calculate myBASE and myUNDER given openingPrice and range
		// NOTE: i.e. user can add 1000 DAI, but maybe DAI needs to be sold 

		this.openingTotalBASE = myBASE + myUNDER * openingPrice;
		this.openingTotalUNDER = myBASE / openingPrice + myUNDER;
		console.log("this.openingTotalUNDER: " + this.openingTotalUNDER)
	}

	// gets pool sizes and prices from live market 
	async getMarketData(web3, position) {
		console.log("UniswapV3 market data not needed to be loaded, skip. ");
	}

	// gets user balance in [BASE, UNDER] for given price. 
	getCurrentValue(newPrice) {
		// if price is below minPrice, I have UNDER only
		if(newPrice <= this.minPrice) {
			//let balanceBASE = this.openingTotalUNDER * this.minPrice;


			//let balanceUNDER = this.totalBASE / this.minPrice;
			return [this.openingTotalUNDER * newPrice, this.openingTotalUNDER];
		}

		// in the range, sell UNDER incrementally 
		if(newPrice > this.minPrice && newPrice < this.maxPrice) {
			return this.getCurveBalances(newPrice);
		}

		return this.getCurveBalances(this.maxPrice);
	}

	getCurveBalances(newPrice) {
		// NOTE: only works when range is > entryPrice
		let parts = 1000;
		let finalBASE = 0;
		let finalUNDER = this.openingTotalUNDER;//this.myBASE / this.minPrice + this.myUNDER;
		let partUNDER = finalUNDER / parts;
		let step = (this.maxPrice - this.minPrice) / parts;
		for(let price = this.minPrice + step; price <= newPrice; price += step) {
			// sell UNDER
			finalBASE += partUNDER * price;
			finalUNDER -= partUNDER;
		}
			
		return [finalBASE + finalUNDER * newPrice, finalBASE / newPrice + finalUNDER];
	}
}		
