import { CoinGeckoPrices } from './CoinGeckoPrices.js';
import uniswapABI from "../abis/uniswapABI.json";
import daiABI from "../abis/daiABI.json";
import { usdcAddress, getContractInstance } from './common.js'
		
export default class Uniswap {		
	constructor(marketAddress, addressBASE, addressUNDER, myLIQ) {
		this.marketAddress = marketAddress;
		this.addressBASE = addressBASE;
		this.addressUNDER = addressUNDER;
		this.feeInPercent = 0.3;

		// my position
		this.myBASE = 0;
		this.myUNDER = 0;
		this.myLIQ = myLIQ;

		// pool 
		this.poolBASE = 0;
		this.poolUNDER = 0;
		this.poolLIQ = 0;
		this.k = this.poolBASE * this.poolUNDER;
	}

	// gets pool sizes and prices from live market 
	async getMarketData(web3, position) {
		let marketInstance = getContractInstance(web3, uniswapABI, this.marketAddress);
		let baseInstance = getContractInstance(web3, daiABI, this.addressBASE);
		let underInstance = getContractInstance(web3, daiABI, this.addressUNDER);

		let ethBalance = await web3.eth.getBalance(this.marketAddress);
		let poolLIQ = await marketInstance.methods.totalSupply().call();
		let poolBASE = await baseInstance.methods.balanceOf(this.marketAddress).call();
		let poolUNDER = await underInstance.methods.balanceOf(this.marketAddress).call();

		// if pool is using eth instead of weth
		if(poolUNDER / 10 ** 18 === 0 && ethBalance / 10 ** 18 > 0) {
			poolUNDER = ethBalance;
		}

		// save to position
		this.poolUNDER = poolUNDER / (this.addressUNDER !== usdcAddress ? 10 ** 18 : 10 ** 6);  
		this.poolLIQ = poolLIQ / 10 ** 18; 
		this.poolBASE = poolBASE / (this.addressBASE !== usdcAddress ? 10 ** 18 : 10 ** 6);
		this.k = this.poolUNDER * this.poolBASE;
		
		this.priceLIQUNDER = this.poolUNDER / this.poolLIQ;
		this.priceLIQBASE = this.poolBASE / this.poolLIQ;
		this.priceUNDERBASE = this.poolBASE / this.poolUNDER;

		this.priceBASEUSD = await CoinGeckoPrices.getTokenPriceInUSD(this.addressBASE);
		this.priceUNDERUSD = await CoinGeckoPrices.getTokenPriceInUSD(this.addressUNDER);

		console.log("AMM market data loaded. " + position.base.symbol + ": " + this.priceBASEUSD + " USD, " + position.under.symbol + ": " + this.priceUNDERUSD + " USD");
	}

	// gets current value in [BASE, UNDER]
	getCurrentValue(currentPrice) {
		let valueInBASE = this.myLIQ * this.priceLIQBASE + this.myLIQ * this.priceLIQUNDER * currentPrice;
		let valueInUNDER = valueInBASE / currentPrice;
		return [valueInBASE, valueInUNDER];
	}

	// gets opening value in [BASE, UNDER] todo
	getOpeningValue() {
		//return [this.ethCollateral * this.openingPrice, this.ethCollateral];
	}

	addLiquidity(exactUNDER, exactBASE) {
		let exactLIQ = exactUNDER * (this.poolLIQ / this.poolUNDER);
		//console.log("Pool before: " + market.poolUNDER + " ETH + " + market.poolBASE + " Token");
		this.poolUNDER += exactUNDER;
		this.poolBASE += exactBASE;
		this.poolLIQ += exactLIQ;
		this.k = this.poolBASE * this.poolUNDER;
		//console.log("Pool after: " + market.poolUNDER + " ETH + " + market.poolBASE + " Token");
		return exactLIQ;
	}
	
	removeLiquidity(exactLIQ) {
		let priceLIQUNDER = this.poolUNDER / this.poolLIQ;
		let priceLIQDAI = this.poolBASE / this.poolLIQ;
		let exactUNDER = exactLIQ * priceLIQUNDER;
		let exactBASE = exactLIQ * priceLIQDAI;
		//console.log("Pool before: " + simETHPool + " ETH + " + simDAIPool + " DAI");
		this.poolUNDER -= exactUNDER;
		this.poolBASE -= exactBASE;
		this.poolLIQ -= exactLIQ;
		this.k = this.poolBASE * this.poolUNDER;
		//console.log("Pool after: " + simETHPool + " ETH + " + simDAIPool + " DAI");
		return [exactUNDER, exactBASE];
	}

	buyUNDER(exactBASE) {			
		// calculate 
		let exactUNDER = Math.abs(this.k / (this.poolBASE + exactBASE) - this.poolUNDER);
						
		// apply fee
		let exactUNDERWithFees = exactUNDER * (1 - this.feeInPercent / 100);
		
		// update BASE and UNDER pools and recalculate k (since fee is added to pools)
		this.poolUNDER -= exactUNDERWithFees;
		this.poolBASE += exactBASE;
		this.k = this.poolUNDER * this.poolBASE;
		
		return exactUNDERWithFees;
	}

	sellUNDER(exactUNDER) {				
		// calculate 
		let exactBASE = Math.abs(this.k / (this.poolUNDER + exactUNDER) - this.poolBASE);
		
		// apply fee
		let exactBASEWithFees = exactBASE * (1 - this.feeInPercent / 100);
		
		// update BASE and UNDER pools and recalculate k (since fee is added to pools)
		this.poolUNDER += exactUNDER;
		this.poolBASE -= exactBASEWithFees;
		this.k = this.poolUNDER * this.poolBASE;
		
		return exactBASEWithFees;
	}

	getInputPrice(inputAmount, inputPool, outputPool) {
		return (inputAmount * outputPool) / (inputPool + inputAmount);
	}

	// helper method to set new price
	setMarketPrice(newPrice) {
		let k = this.poolBASE * this.poolUNDER;
		this.poolUNDER = Math.sqrt(k / newPrice);
		this.poolBASE = Math.sqrt(k * newPrice);
		this.k = this.poolUNDER * this.poolBASE;
	}

	getPrice() {
		return this.poolBASE / this.poolUNDER;
	}
}		
