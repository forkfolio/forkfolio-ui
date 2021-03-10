import { CoinGeckoPrices } from './CoinGeckoPrices.js';
import uniswapABI from "../abis/uniswapABI.json";
import daiABI from "../abis/daiABI.json";
import { usdcAddress } from './common.js'
		
export default class Uniswap {		
	constructor(marketAddress, addressBASE, addressUNDER, poolBASE, poolUNDER, poolLIQ, feeInPercent) {
		this.marketAddress = marketAddress;
		this.addressBASE = addressBASE;
		this.addressUNDER = addressUNDER;

		this.poolBASE = poolBASE;
		this.poolUNDER = poolUNDER;
		this.poolLIQ = poolLIQ;
		this.k = poolBASE * poolUNDER;
		this.feeInPercent = feeInPercent;
		//this.volume = 0; // in contracts, not dai
	}

	getContractInstance(web3, abi, address) {			
		console.log("Loading contract instance for address: " + address)
		return new web3.eth.Contract(abi, address);
	}

	// gets pool sizes and prices from live market 
	async getMarketData(web3, position) {
		let marketInstance = this.getContractInstance(web3, uniswapABI, this.marketAddress);
		let baseInstance = this.getContractInstance(web3, daiABI, this.addressBASE);
		let underInstance = this.getContractInstance(web3, daiABI, this.addressUNDER);

		let ethBalance = await web3.eth.getBalance(this.marketAddress); // 
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
		
		this.priceLIQUNDER = this.poolUNDER / this.poolLIQ;
		this.priceLIQBASE = this.poolBASE / this.poolLIQ;
		this.priceUNDERBASE = this.poolBASE / this.poolUNDER;

		this.priceBASEUSD = await CoinGeckoPrices.getTokenPriceInUSD(this.addressBASE);
		this.priceUNDERUSD = await CoinGeckoPrices.getTokenPriceInUSD(this.addressUNDER);
		console.log("AMM market data loaded. " + position.symbolBASE + ": " + this.priceBASEUSD + " USD, " + position.symbolUNDER + ": " + this.priceUNDERUSD + " USD");
		
		// get live data
		/*return new Promise((accept, reject) => {
			web3.eth.getBalance(position.marketAddress, (error, ethBalance) => {
				marketInstance.methods.totalSupply((error, poolLIQ) => {
					baseInstance.methods.balanceOf(position.marketAddress, (error, poolBASE) => {
						underInstance.methods.balanceOf(position.marketAddress, async (error, poolUNDER) => {

	
							console.log(1)
							// if pool is using eth instead of weth
							if(poolUNDER / 10 ** 18 === 0 && ethBalance / 10 ** 18 > 0) {
								poolUNDER = ethBalance;
							}

							// save to position
							this.poolUNDER = poolUNDER / (this.addressUNDER !== usdcAddress ? 10 ** 18 : 10 ** 6);  
							this.poolLIQ = poolLIQ / 10 ** 18; 
							this.poolBASE = poolBASE / (this.addressBASE !== usdcAddress ? 10 ** 18 : 10 ** 6);
							
							this.priceLIQUNDER = this.poolUNDER / this.poolLIQ;
							this.priceLIQBASE = this.poolBASE / this.poolLIQ;
							this.priceUNDERBASE = this.poolBASE / this.poolUNDER;
							console.log(4)

							this.priceBASEUSD = await CoinGeckoPrices.getTokenPriceInUSD(this.addressBASE);
							this.priceUNDERUSD = await CoinGeckoPrices.getTokenPriceInUSD(this.addressUNDER);
							console.log("AMM market data loaded. " + position.symbolBASE + ": " + this.priceBASEUSD + " USD, " + position.symbolUNDER + ": " + this.priceUNDERUSD + " USD");

							//position.marketData = market;

							// get LPT balances for all addresses
							// disable LPT for now
							//for(let i = 0; i < positions.length; i++) {
							//	if(positions[i].currentLPT == undefined) {
							//		marketInstance.balanceOf(positions[i].address, (error, currentLPT) => {
							//			positions[i].currentLPT = currentLPT / 10 ** 18;
							//		});
							//	}
							//}
							
							accept(1);
							return;
						});
					});
				});
			});
		});*/
	}

	addLiquidity(exactUNDER, exactBASE) {
		let exactLIQ = exactUNDER * (this.poolLPT / this.poolUNDER);
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
		//let inputPool = market.poolBASE;
		//let outputPool = market.poolUNDER;
		let k = this.poolBASE * this.poolUNDER;

		this.poolUNDER = Math.sqrt(k / newPrice);
		this.poolBASE = Math.sqrt(k * newPrice);
		this.k = this.poolUNDER * this.poolBASE;
	}
}		
