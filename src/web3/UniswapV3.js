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

		// total in BASE amd total in UNDER
		this.openingTotalBASE = myBASE + myUNDER * openingPrice;

		this.token1V2 = this.openingTotalBASE / 2;
		this.token2V2 = this.token1V2 / openingPrice;
		this.L = Math.sqrt(this.token1V2 * this.token2V2);
		this.L2 = this.token1V2 * this.token2V2;
		this.T = this.L * Math.sqrt(minPrice);
		this.H = this.L / Math.sqrt(maxPrice);
		this.maxToken2 = this.L2 / this.H - this.T;
		this.maxToken1 = this.L2 / this.T - this.H;
		this.LP_a = openingPrice > maxPrice ? 0 : (this.L / Math.sqrt(openingPrice) - this.H) * openingPrice;
		this.LP_b = openingPrice > maxPrice ? this.maxToken2 : this.L * Math.sqrt(openingPrice) - this.T;
		this.LP = this.LP_a + this.LP_b;
		this.multiplier = openingPrice > minPrice ? this.openingTotalBASE / this.LP : this.openingTotalBASE / (openingPrice * this.maxToken1);
	}

	// gets pool sizes and prices from live market 
	async getMarketData(web3, position) {
		console.log("UniswapV3 market data not needed to be loaded, skip. ");
	}

	// gets user balance in [BASE, UNDER] for given price 
	getCurrentValue(newPrice) {
		let x, y, value; // x is BASE. y is UNDER
		if (newPrice < this.minPrice) {
			x = this.maxToken1 * this.multiplier;
			y = 0;
			value = x * newPrice;
		} else if (newPrice >= this.minPrice && newPrice <= this.maxPrice) {
			x = (this.L / Math.sqrt(newPrice) - this.H) * this.multiplier;
			y = (this.L * Math.sqrt(newPrice) - this.T) * this.multiplier;
			value = x * newPrice + y;
		} else if (newPrice > this.maxPrice) {
			x = 0;
			y = this.maxToken2 * this.multiplier;
			value = y;
		}

		return [value, value / newPrice];
	}
}		
