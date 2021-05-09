import { CoinGeckoPrices } from './CoinGeckoPrices.js';
import uniswapABI from "../abis/uniswapABI.json";
import daiABI from "../abis/daiABI.json";
import { usdcAddress, getContractInstance } from './common.js'
		
export default class UniswapV3 {		
	constructor(myBASE, myUNDER, openingPrice, minPrice, maxPrice, feeInPercent) {
		//this.marketAddress = marketAddress;
		//this.addressBASE = addressBASE;
		//this.addressUNDER = addressUNDER;
		this.myBASE = myBASE;
		this.myUNDER = myUNDER;
		this.openingPrice = openingPrice; // price when liq position is opened
		this.minPrice = minPrice;
		this.maxPrice = maxPrice;
		this.feeInPercent = feeInPercent;

		this.totalBASE = myBASE + myUNDER * openingPrice;
		console.log(this.totalBASE)
	}

	// gets pool sizes and prices from live market 
	async getMarketData(web3, position) {
		console.log("UniswapV3 market data not needed to be loaded, skip. ");
	}

	// gets user balance in [BASE, UNDER] for given price. 
	getCurrentValue(newPrice) {
		// if price is below minPrice, I have UNDER only
		if(newPrice <= this.minPrice) {
			let balanceUNDER = this.totalBASE / this.minPrice;
			//console.log(balanceUNDER)
			return [balanceUNDER * newPrice, balanceUNDER];
		}

		// todo: fix this
		/*if(newPrice > this.minPrice && newPrice < this.maxPrice) {
			let midPrice = (this.maxPrice + this.minPrice) / 2;
			
			let k = this.myBase 
			return [2000, 0];
		}*/

		// if price is above maxPrice, I have BASE only
		/*if(newPrice >= maxPrice) {
			let balanceBASE = totalBASE / this.minPrice;
			return [balanceUNDER * newPrice, balanceUNDER]
		}*/
	}
}		
